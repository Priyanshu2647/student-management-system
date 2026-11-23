import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';

// @desc    Get attendance records with filter
// @route   GET /api/attendance
// @access  Private (Admin, Teacher)
export const getAttendance = async (req, res, next) => {
  try {
    const { courseId, studentId, date, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (courseId) {
      query.course = courseId;
    }

    if (studentId) {
      query.student = studentId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [attendanceList, total] = await Promise.all([
      Attendance.find(query)
        .populate('student', 'firstName lastName rollNumber email department semester')
        .populate('course', 'courseCode courseName')
        .populate('teacher', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: attendanceList.length,
      total,
      attendance: attendanceList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record or update single student attendance
// @route   POST /api/attendance
// @access  Private (Admin, Teacher)
export const recordAttendance = async (req, res, next) => {
  try {
    const { course, student, date, status = 'Present', remarks = '' } = req.body;

    if (!course || !student || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course, student, and date',
      });
    }

    let teacherId = null;
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) teacherId = teacher._id;
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setHours(23, 59, 59, 999));

    // Upsert attendance for this student, course, and day
    const record = await Attendance.findOneAndUpdate(
      {
        course,
        student,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        course,
        student,
        date: targetDate,
        status,
        remarks,
        teacher: teacherId,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record bulk attendance for multiple students
// @route   POST /api/attendance/bulk
// @access  Private (Admin, Teacher)
export const recordBulkAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId, date, and an array of attendance records',
      });
    }

    let teacherId = null;
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) teacherId = teacher._id;
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setHours(23, 59, 59, 999));

    const bulkOps = records.map((item) => ({
      updateOne: {
        filter: {
          course: courseId,
          student: item.studentId,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
        update: {
          $set: {
            course: courseId,
            student: item.studentId,
            date: targetDate,
            status: item.status || 'Present',
            remarks: item.remarks || '',
            teacher: teacherId,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: `Bulk attendance recorded: ${result.upsertedCount + result.modifiedCount} records processed`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, Teacher)
export const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    if (req.body.status) record.status = req.body.status;
    if (req.body.remarks !== undefined) record.remarks = req.body.remarks;

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance statistics for a specific student
// @route   GET /api/attendance/stats/:studentId
// @access  Private
export const getStudentAttendanceStats = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const records = await Attendance.find({ student: studentId })
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });

    const totalDays = records.length;
    const presentDays = records.filter(
      (r) => r.status === 'Present' || r.status === 'Late'
    ).length;
    const absentDays = records.filter((r) => r.status === 'Absent').length;
    const excusedDays = records.filter((r) => r.status === 'Excused').length;
    const overallPercentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 10) / 10 : 0;

    // Course-wise breakdown
    const courseStatsMap = {};
    records.forEach((rec) => {
      const code = rec.course?.courseCode || 'Unknown';
      const name = rec.course?.courseName || 'General';
      if (!courseStatsMap[code]) {
        courseStatsMap[code] = {
          courseCode: code,
          courseName: name,
          total: 0,
          present: 0,
          absent: 0,
          percentage: 0,
        };
      }
      courseStatsMap[code].total += 1;
      if (rec.status === 'Present' || rec.status === 'Late') {
        courseStatsMap[code].present += 1;
      } else {
        courseStatsMap[code].absent += 1;
      }
    });

    const courseBreakdown = Object.values(courseStatsMap).map((c) => ({
      ...c,
      percentage: c.total > 0 ? Math.round((c.present / c.total) * 100 * 10) / 10 : 0,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        excusedDays,
        overallPercentage,
      },
      courseBreakdown,
      recentRecords: records.slice(0, 15),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's own attendance
// @route   GET /api/attendance/student/me
// @access  Private (Student)
export const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    req.params.studentId = student._id;
    return getStudentAttendanceStats(req, res, next);
  } catch (error) {
    next(error);
  }
};
