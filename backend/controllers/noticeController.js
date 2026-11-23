import Notice from '../models/Notice.js';

// @desc    Get all notices with audience & category filter
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res, next) => {
  try {
    const { category, audience, priority, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // Role-based audience filtering
    if (req.user.role === 'student') {
      query.targetAudience = { $in: ['All', 'Student'] };
    } else if (req.user.role === 'teacher') {
      query.targetAudience = { $in: ['All', 'Teacher'] };
    } else if (audience && audience !== 'All') {
      query.targetAudience = audience;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Show pinned notices first, then newest
    const [notices, total] = await Promise.all([
      Notice.find(query)
        .populate('author', 'name role')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notice.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: notices.length,
      total,
      notices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Private
export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('author', 'name role');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin, Teacher)
export const createNotice = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category = 'General',
      targetAudience = 'All',
      priority = 'Medium',
      isPinned = false,
      expiresAt,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notice title and content',
      });
    }

    const notice = await Notice.create({
      title,
      content,
      category,
      targetAudience,
      priority,
      isPinned: Boolean(isPinned),
      expiresAt: expiresAt || null,
      author: req.user._id,
    });

    const populatedNotice = await Notice.findById(notice._id).populate('author', 'name role');

    res.status(201).json({
      success: true,
      message: 'Notice published successfully',
      notice: populatedNotice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin, Notice Author)
export const updateNotice = async (req, res, next) => {
  try {
    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    // Only author or admin can update
    if (
      req.user.role !== 'admin' &&
      notice.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this notice',
      });
    }

    const fieldsToUpdate = [
      'title',
      'content',
      'category',
      'targetAudience',
      'priority',
      'isPinned',
      'expiresAt',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        notice[field] = req.body[field];
      }
    });

    await notice.save();

    const updatedNotice = await Notice.findById(notice._id).populate('author', 'name role');

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      notice: updatedNotice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin, Notice Author)
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      notice.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notice',
      });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
