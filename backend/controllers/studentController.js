import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all students with filter, search & pagination
// @route   GET /api/students
// @access  Private (Admin, Teacher)
export const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      department,
      semester,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by semester
    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search by name, roll number, or email
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('coursesEnrolled', 'courseCode courseName credits')
        .populate('user', 'isActive avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email role isActive avatar')
      .populate('coursesEnrolled');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // If student role, ensure they can only view their own profile
    if (req.user.role === 'student' && student.user?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile',
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student (Admin)
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password = 'password123',
      rollNumber,
      admissionNumber,
      department,
      semester = 1,
      academicYear = '2024-2028',
      gender = 'Male',
      phone = '',
      dateOfBirth,
      coursesEnrolled = [],
      address = {},
      guardian = {},
      status = 'Active',
    } = req.body;

    if (!firstName || !lastName || !email || !rollNumber || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, rollNumber, and department',
      });
    }

    // Check if email already in use
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Check if roll number already in use
    const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: 'Roll number already exists. Please assign a unique roll number.',
      });
    }

    // 1. Create User
    const user = await User.create({
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      password,
      role: 'student',
    });

    // 2. Create Student
    const student = await Student.create({
      user: user._id,
      rollNumber: rollNumber.toUpperCase(),
      admissionNumber: admissionNumber ? admissionNumber.toUpperCase() : `ADM-${Date.now().toString().slice(-6)}`,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      gender,
      dateOfBirth,
      department,
      semester: Number(semester),
      academicYear,
      coursesEnrolled,
      address,
      guardian,
      status,
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('coursesEnrolled', 'courseCode courseName')
      .populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student record
// @route   PUT /api/students/:id
// @access  Private (Admin, Teacher)
export const updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // If changing roll number, check uniqueness
    if (req.body.rollNumber && req.body.rollNumber.toUpperCase() !== student.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber: req.body.rollNumber.toUpperCase() });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: 'The new roll number is already assigned to another student',
        });
      }
      student.rollNumber = req.body.rollNumber.toUpperCase();
    }

    // Update student fields
    const fieldsToUpdate = [
      'firstName',
      'lastName',
      'phone',
      'gender',
      'dateOfBirth',
      'department',
      'semester',
      'academicYear',
      'coursesEnrolled',
      'address',
      'guardian',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    // Also update associated User name if firstName or lastName changed
    if (req.body.firstName || req.body.lastName) {
      await User.findByIdAndUpdate(student.user, {
        name: `${student.firstName} ${student.lastName}`,
      });
    }

    const updatedStudent = await Student.findById(student._id)
      .populate('coursesEnrolled', 'courseCode courseName credits')
      .populate('user', 'name email role isActive avatar');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record and user account
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete associated User
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    // Delete Student record
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student and associated user account removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's personal profile
// @route   GET /api/students/profile/me
// @access  Private (Student)
export const getMyStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('coursesEnrolled')
      .populate('user', 'name email avatar role');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found for this account',
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};
