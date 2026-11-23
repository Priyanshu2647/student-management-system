import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_jwt_key_student_management_system_2026_xyz',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin for staff)
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', ...extraData } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      avatar: extraData.avatar || '',
    });

    let profileData = null;

    // If registering as student, create default student record
    if (role === 'student') {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      const rollNumber =
        extraData.rollNumber ||
        `STU-${Date.now().toString().slice(-6)}`;

      profileData = await Student.create({
        user: user._id,
        rollNumber,
        admissionNumber: `ADM-${Date.now().toString().slice(-6)}`,
        firstName,
        lastName,
        email: user.email,
        phone: extraData.phone || '',
        department: extraData.department || 'Computer Science',
        semester: extraData.semester || 1,
      });
    }

    // If registering as teacher, create default teacher record
    if (role === 'teacher') {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Faculty';
      const lastName = nameParts.slice(1).join(' ') || 'Member';
      const teacherId =
        extraData.teacherId ||
        `TCH-${Date.now().toString().slice(-4)}`;

      profileData = await Teacher.create({
        user: user._id,
        teacherId,
        firstName,
        lastName,
        email: user.email,
        phone: extraData.phone || '',
        department: extraData.department || 'Computer Science',
        designation: extraData.designation || 'Assistant Professor',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Fetch related profile based on role
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('coursesEnrolled', 'courseCode courseName');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id }).populate('assignedCourses', 'courseCode courseName');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('coursesEnrolled');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id }).populate('assignedCourses');
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    await user.save();

    // If role is student or teacher, update contact details if provided
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        if (req.body.phone) student.phone = req.body.phone;
        if (req.body.address) student.address = { ...student.address, ...req.body.address };
        if (req.body.guardian) student.guardian = { ...student.guardian, ...req.body.guardian };
        await student.save();
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        if (req.body.phone) teacher.phone = req.body.phone;
        if (req.body.qualification) teacher.qualification = req.body.qualification;
        await teacher.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
