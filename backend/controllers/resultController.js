import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// @desc    Get all exam results with filters
// @route   GET /api/results
// @access  Private
export const getResults = async (req, res, next) => {
  try {
    const { courseId, studentId, examType, semester, page = 1, limit = 50 } = req.query;

    const query = {};

    if (courseId) query.course = courseId;
    if (studentId) query.student = studentId;
    if (examType && examType !== 'All') query.examType = examType;
    if (semester && semester !== 'All') query.semester = Number(semester);

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [results, total] = await Promise.all([
      Result.find(query)
        .populate('student', 'firstName lastName rollNumber email department semester')
        .populate('course', 'courseCode courseName credits')
        .populate('declaredBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Result.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single result by ID
// @route   GET /api/results/:id
// @access  Private
export const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'firstName lastName rollNumber department semester')
      .populate('course', 'courseCode courseName credits')
      .populate('declaredBy', 'name email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add examination result / marks
// @route   POST /api/results
// @access  Private (Admin, Teacher)
export const createResult = async (req, res, next) => {
  try {
    const {
      student,
      course,
      examType = 'Final',
      marksObtained,
      totalMarks = 100,
      semester,
      academicYear = '2024-2025',
      remarks = '',
    } = req.body;

    if (!student || !course || marksObtained === undefined || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student, course, marksObtained, and semester',
      });
    }

    if (Number(marksObtained) > Number(totalMarks)) {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained cannot exceed total marks',
      });
    }

    const result = new Result({
      student,
      course,
      examType,
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks),
      semester: Number(semester),
      academicYear,
      remarks,
      declaredBy: req.user._id,
    });

    await result.save();

    const populated = await Result.findById(result._id)
      .populate('student', 'firstName lastName rollNumber')
      .populate('course', 'courseCode courseName credits');

    res.status(201).json({
      success: true,
      message: 'Result marks published successfully',
      result: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update examination result
// @route   PUT /api/results/:id
// @access  Private (Admin, Teacher)
export const updateResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    const fieldsToUpdate = [
      'marksObtained',
      'totalMarks',
      'examType',
      'semester',
      'academicYear',
      'remarks',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        result[field] = req.body[field];
      }
    });

    await result.save();

    const populated = await Result.findById(result._id)
      .populate('student', 'firstName lastName rollNumber')
      .populate('course', 'courseCode courseName');

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      result: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete examination result
// @route   DELETE /api/results/:id
// @access  Private (Admin)
export const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    await result.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Result removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for a specific student with GPA computation
// @route   GET /api/results/student/:studentId
// @access  Private
export const getStudentResults = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const results = await Result.find({ student: studentId })
      .populate('course', 'courseCode courseName credits')
      .sort({ semester: 1, createdAt: -1 });

    // Calculate overall GPA and performance summary
    const gradePoints = {
      'A+': 10,
      A: 9,
      'B+': 8,
      B: 7,
      C: 6,
      D: 5,
      F: 0,
    };

    let totalCredits = 0;
    let earnedGradePoints = 0;
    let totalMarks = 0;
    let totalObtained = 0;

    results.forEach((r) => {
      const credits = r.course?.credits || 3;
      const point = gradePoints[r.grade] || 0;
      totalCredits += credits;
      earnedGradePoints += point * credits;
      totalMarks += r.totalMarks;
      totalObtained += r.marksObtained;
    });

    const cgpa =
      totalCredits > 0
        ? Math.round((earnedGradePoints / totalCredits) * 100) / 100
        : 0;

    const overallPercentage =
      totalMarks > 0
        ? Math.round((totalObtained / totalMarks) * 100 * 10) / 10
        : 0;

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
      },
      summary: {
        totalSubjects: results.length,
        totalCredits,
        cgpa,
        overallPercentage,
      },
      results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's results
// @route   GET /api/results/student/me
// @access  Private (Student)
export const getMyResults = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    req.params.studentId = student._id;
    return getStudentResults(req, res, next);
  } catch (error) {
    next(error);
  }
};
