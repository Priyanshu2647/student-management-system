import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// @desc    Get all courses with search and filters
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res, next) => {
  try {
    const { search, department, semester, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { courseCode: searchRegex },
        { courseName: searchRegex },
        { department: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('teacher', 'firstName lastName teacherId email')
        .sort({ courseCode: 1 })
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'teacher',
      'firstName lastName teacherId email department'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Get count of enrolled students
    const enrolledStudentsCount = await Student.countDocuments({
      coursesEnrolled: course._id,
    });

    res.status(200).json({
      success: true,
      course: {
        ...course.toObject(),
        enrolledStudentsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin)
export const createCourse = async (req, res, next) => {
  try {
    const {
      courseCode,
      courseName,
      department,
      semester,
      credits = 3,
      description = '',
      teacher = null,
      maxCapacity = 60,
      status = 'Active',
    } = req.body;

    if (!courseCode || !courseName || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseCode, courseName, department and semester',
      });
    }

    const courseExists = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
    });
    if (courseExists) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists',
      });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase(),
      courseName,
      department,
      semester: Number(semester),
      credits: Number(credits),
      description,
      teacher: teacher || null,
      maxCapacity: Number(maxCapacity),
      status,
    });

    // If teacher assigned, update Teacher record
    if (teacher) {
      await Teacher.findByIdAndUpdate(teacher, {
        $addToSet: { assignedCourses: course._id },
      });
    }

    const populatedCourse = await Course.findById(course._id).populate(
      'teacher',
      'firstName lastName teacherId'
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: populatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (
      req.body.courseCode &&
      req.body.courseCode.toUpperCase() !== course.courseCode
    ) {
      const codeExists = await Course.findOne({
        courseCode: req.body.courseCode.toUpperCase(),
      });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'New course code is already taken',
        });
      }
      course.courseCode = req.body.courseCode.toUpperCase();
    }

    const oldTeacherId = course.teacher?.toString();
    const newTeacherId = req.body.teacher;

    const fieldsToUpdate = [
      'courseName',
      'department',
      'semester',
      'credits',
      'description',
      'teacher',
      'maxCapacity',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field] === '' ? null : req.body[field];
      }
    });

    await course.save();

    // If teacher assignment changed, update both old and new teachers
    if (newTeacherId !== undefined && oldTeacherId !== newTeacherId) {
      if (oldTeacherId) {
        await Teacher.findByIdAndUpdate(oldTeacherId, {
          $pull: { assignedCourses: course._id },
        });
      }
      if (newTeacherId) {
        await Teacher.findByIdAndUpdate(newTeacherId, {
          $addToSet: { assignedCourses: course._id },
        });
      }
    }

    const updatedCourse = await Course.findById(course._id).populate(
      'teacher',
      'firstName lastName teacherId'
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Unassign from teachers
    await Teacher.updateMany(
      { assignedCourses: course._id },
      { $pull: { assignedCourses: course._id } }
    );

    // Unenroll from students
    await Student.updateMany(
      { coursesEnrolled: course._id },
      { $pull: { coursesEnrolled: course._id } }
    );

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses assigned to the logged-in teacher
// @route   GET /api/courses/teacher/assigned
// @access  Private (Teacher)
export const getTeacherAssignedCourses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const courses = await Course.find({ teacher: teacher._id }).populate(
      'teacher',
      'firstName lastName'
    );

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    next(error);
  }
};
