import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all teachers with search, filters & pagination
// @route   GET /api/teachers
// @access  Private (Admin, Teacher, Student)
export const getTeachers = async (req, res, next) => {
  try {
    const { search, department, designation, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (designation && designation !== 'All') {
      query.designation = designation;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { teacherId: searchRegex },
        { email: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [teachers, total] = await Promise.all([
      Teacher.find(query)
        .populate('assignedCourses', 'courseCode courseName credits')
        .populate('user', 'isActive avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Teacher.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: teachers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      teachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher by ID
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'name email role isActive avatar')
      .populate('assignedCourses');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found',
      });
    }

    res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new teacher (Admin)
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password = 'password123',
      teacherId,
      department,
      designation = 'Assistant Professor',
      qualification = 'Ph.D. / M.Tech',
      phone = '',
      joiningDate = Date.now(),
      assignedCourses = [],
      status = 'Active',
    } = req.body;

    if (!firstName || !lastName || !email || !teacherId || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, teacherId, and department',
      });
    }

    // Check email uniqueness
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check teacherId uniqueness
    const teacherExists = await Teacher.findOne({ teacherId: teacherId.toUpperCase() });
    if (teacherExists) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID already exists',
      });
    }

    // 1. Create User account
    const user = await User.create({
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      password,
      role: 'teacher',
    });

    // 2. Create Teacher record
    const teacher = await Teacher.create({
      user: user._id,
      teacherId: teacherId.toUpperCase(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      department,
      designation,
      qualification,
      joiningDate,
      assignedCourses,
      status,
    });

    // If courses were assigned, update Course model as well
    if (assignedCourses && assignedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { teacher: teacher._id }
      );
    }

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'courseCode courseName')
      .populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: populatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher record
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res, next) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    // Check teacherId uniqueness if changed
    if (req.body.teacherId && req.body.teacherId.toUpperCase() !== teacher.teacherId) {
      const existingId = await Teacher.findOne({ teacherId: req.body.teacherId.toUpperCase() });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is already in use',
        });
      }
      teacher.teacherId = req.body.teacherId.toUpperCase();
    }

    const fieldsToUpdate = [
      'firstName',
      'lastName',
      'phone',
      'department',
      'designation',
      'qualification',
      'assignedCourses',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    await teacher.save();

    // Update user name if altered
    if (req.body.firstName || req.body.lastName) {
      await User.findByIdAndUpdate(teacher.user, {
        name: `${teacher.firstName} ${teacher.lastName}`,
      });
    }

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'courseCode courseName credits')
      .populate('user', 'name email role isActive avatar');

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher record and user account
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    // Remove teacher reference from courses
    await Course.updateMany({ teacher: teacher._id }, { $set: { teacher: null } });

    // Delete associated User
    if (teacher.user) {
      await User.findByIdAndDelete(teacher.user);
    }

    await teacher.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Teacher removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in teacher's profile
// @route   GET /api/teachers/profile/me
// @access  Private (Teacher)
export const getMyTeacherProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('assignedCourses')
      .populate('user', 'name email avatar role');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found for this account',
      });
    }

    res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    next(error);
  }
};
