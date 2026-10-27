import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Goal from '../models/Goal.js';

// @desc    Get all assignments for user with search, filter, sort, pagination
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res, next) => {
  try {
    const {
      q,
      course,
      priority,
      status,
      type,
      dueFrom,
      dueTo,
      sort = 'deadline_asc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: req.user._id };

    // Search by title or course or description
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { course: searchRegex },
        { description: searchRegex },
      ];
    }

    if (course && course.trim()) {
      query.course = course.trim();
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      query.priority = priority;
    }

    if (status && ['Not Started', 'In Progress', 'Submitted'].includes(status)) {
      query.status = status;
    }

    if (type && ['Individual', 'Group'].includes(type)) {
      query.type = type;
    }

    if (dueFrom || dueTo) {
      query.deadline = {};
      if (dueFrom) query.deadline.$gte = new Date(dueFrom);
      if (dueTo) query.deadline.$lte = new Date(dueTo);
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'deadline_asc') sortOptions = { deadline: 1 };
    else if (sort === 'deadline_desc') sortOptions = { deadline: -1 };
    else if (sort === 'priority_desc') sortOptions = { priority: -1, deadline: 1 };
    else if (sort === 'createdAt_desc') sortOptions = { createdAt: -1 };
    else sortOptions = { deadline: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [assignments, totalCount] = await Promise.all([
      Assignment.find(query)
        .populate('goalId', 'title category')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Assignment.countDocuments(query),
    ]);

    // Unique courses list for filter dropdown
    const courses = await Assignment.distinct('course', { user: req.user._id });

    res.status(200).json({
      success: true,
      data: assignments,
      courses,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard summary statistics & priority strips
// @route   GET /api/assignments/dashboard
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const warningDays = req.user.deadlineWarningDays || 3;
    const now = new Date();
    const warningWindowEnd = new Date(now.getTime() + warningDays * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch active assignments (not submitted)
    const activeAssignments = await Assignment.find({
      user: userId,
      status: { $ne: 'Submitted' },
    })
      .populate('goalId', 'title category')
      .sort({ deadline: 1 });

    // Completed this week
    const completedThisWeekCount = await Assignment.countDocuments({
      user: userId,
      status: 'Submitted',
      updatedAt: { $gte: oneWeekAgo },
    });

    const overdue = [];
    const upcomingWarning = [];
    const futureUpcoming = [];

    activeAssignments.forEach((assignment) => {
      const due = new Date(assignment.deadline);
      if (due < now) {
        overdue.push(assignment);
      } else if (due <= warningWindowEnd) {
        upcomingWarning.push(assignment);
      } else {
        futureUpcoming.push(assignment);
      }
    });

    // Today's focus: Combine overdue + imminent due + High priority active items
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const focusList = [...activeAssignments].sort((a, b) => {
      // Overdue first
      const aOverdue = new Date(a.deadline) < now;
      const bOverdue = new Date(b.deadline) < now;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Imminent deadline next
      const timeDiff = new Date(a.deadline) - new Date(b.deadline);
      if (Math.abs(timeDiff) > 24 * 60 * 60 * 1000) {
        return timeDiff;
      }
      // If deadlines are within 24h, high priority first
      return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    }).slice(0, 5);

    // Summary stats
    const stats = {
      pending: activeAssignments.length,
      dueSoon: upcomingWarning.length,
      overdue: overdue.length,
      completedThisWeek: completedThisWeekCount,
      warningDays,
    };

    // Active goals summary
    const activeGoals = await Goal.find({
      user: userId,
      status: { $ne: 'Completed' },
    })
      .sort({ targetDate: 1, createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      stats,
      overdue,
      upcomingWarning,
      focusList,
      activeGoals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('goalId', 'title category');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private
export const createAssignment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      course,
      deadline,
      priority,
      status,
      type,
      estimatedHours,
      goalId,
      milestoneId,
    } = req.body;

    if (!title || !course || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, course, and deadline are required.',
      });
    }

    // Verify goal ownership if provided
    let verifiedGoalId = null;
    let verifiedMilestoneId = null;
    if (goalId) {
      const goal = await Goal.findOne({ _id: goalId, user: req.user._id });
      if (goal) {
        verifiedGoalId = goal._id;
        if (milestoneId) {
          const m = goal.milestones.id(milestoneId);
          if (m) verifiedMilestoneId = m._id;
        }
      }
    }

    const assignment = await Assignment.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      course: course.trim(),
      deadline: new Date(deadline),
      priority: priority || 'Medium',
      status: status || 'Not Started',
      type: type || 'Individual',
      estimatedHours: estimatedHours !== undefined ? Number(estimatedHours) : 1,
      goalId: verifiedGoalId,
      milestoneId: verifiedMilestoneId,
    });

    const populated = await Assignment.findById(assignment._id).populate('goalId', 'title category');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private
export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or unauthorized.',
      });
    }

    const {
      title,
      description,
      course,
      deadline,
      priority,
      status,
      type,
      estimatedHours,
      goalId,
      milestoneId,
    } = req.body;

    if (title !== undefined) assignment.title = title.trim();
    if (description !== undefined) assignment.description = description.trim();
    if (course !== undefined) assignment.course = course.trim();
    if (deadline !== undefined) assignment.deadline = new Date(deadline);
    if (priority !== undefined) assignment.priority = priority;
    if (status !== undefined) assignment.status = status;
    if (type !== undefined) assignment.type = type;
    if (estimatedHours !== undefined) assignment.estimatedHours = Number(estimatedHours);

    if (goalId !== undefined) {
      if (goalId === null || goalId === '') {
        assignment.goalId = null;
        assignment.milestoneId = null;
      } else {
        const goal = await Goal.findOne({ _id: goalId, user: req.user._id });
        if (goal) {
          assignment.goalId = goal._id;
          assignment.milestoneId = milestoneId && goal.milestones.id(milestoneId) ? milestoneId : null;
        }
      }
    }

    await assignment.save();
    const updated = await Assignment.findById(assignment._id).populate('goalId', 'title category');

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
