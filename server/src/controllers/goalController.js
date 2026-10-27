import Assignment from '../models/Assignment.js';
import Goal from '../models/Goal.js';

// @desc    Get all goals for user with milestone progress and linked assignment counts
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Fetch linked assignment counts for each goal
    const goalIds = goals.map((g) => g._id);
    const linkedAssignments = await Assignment.find({
      user: req.user._id,
      goalId: { $in: goalIds },
    }).select('title course deadline status priority goalId milestoneId');

    const goalsWithStats = goals.map((goal) => {
      const gObj = goal.toObject();
      const totalMilestones = gObj.milestones.length;
      const completedMilestones = gObj.milestones.filter((m) => m.completed).length;
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      const assignmentsForGoal = linkedAssignments.filter(
        (a) => a.goalId && a.goalId.toString() === goal._id.toString()
      );

      return {
        ...gObj,
        progress,
        completedMilestones,
        totalMilestones,
        linkedAssignments: assignmentsForGoal,
      };
    });

    res.status(200).json({
      success: true,
      data: goalsWithStats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single goal with detailed milestones and linked assignments
// @route   GET /api/goals/:id
// @access  Private
export const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found.',
      });
    }

    const linkedAssignments = await Assignment.find({
      user: req.user._id,
      goalId: goal._id,
    }).sort({ deadline: 1 });

    const gObj = goal.toObject();
    const totalMilestones = gObj.milestones.length;
    const completedMilestones = gObj.milestones.filter((m) => m.completed).length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...gObj,
        progress,
        completedMilestones,
        totalMilestones,
        linkedAssignments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { title, description, category, startDate, targetDate, status, milestones } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Goal title is required.',
      });
    }

    const formattedMilestones = Array.isArray(milestones)
      ? milestones.map((m) => ({
          title: m.title.trim(),
          description: m.description ? m.description.trim() : '',
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
          completed: Boolean(m.completed),
          completedAt: m.completed ? new Date() : null,
        }))
      : [];

    const goal = await Goal.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'Academics',
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
      status: status || 'In Progress',
      milestones: formattedMilestones,
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized.',
      });
    }

    const { title, description, category, startDate, targetDate, status, milestones } = req.body;

    if (title !== undefined) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (category !== undefined) goal.category = category;
    if (startDate !== undefined) goal.startDate = startDate ? new Date(startDate) : goal.startDate;
    if (targetDate !== undefined) goal.targetDate = targetDate ? new Date(targetDate) : null;
    if (status !== undefined) goal.status = status;

    if (Array.isArray(milestones)) {
      goal.milestones = milestones.map((m) => ({
        _id: m._id || undefined,
        title: m.title.trim(),
        description: m.description ? m.description.trim() : '',
        targetDate: m.targetDate ? new Date(m.targetDate) : null,
        completed: Boolean(m.completed),
        completedAt: m.completed ? (m.completedAt ? new Date(m.completedAt) : new Date()) : null,
      }));
    }

    // Auto-update goal status if all milestones are completed
    if (goal.milestones.length > 0) {
      const allDone = goal.milestones.every((m) => m.completed);
      if (allDone && goal.status !== 'Completed') {
        goal.status = 'Completed';
      } else if (!allDone && goal.status === 'Completed') {
        goal.status = 'In Progress';
      }
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully.',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle milestone completion
// @route   PATCH /api/goals/:id/milestones/:milestoneId/toggle
// @access  Private
export const toggleMilestone = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found.',
      });
    }

    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.',
      });
    }

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;

    // Check if all completed
    const allDone = goal.milestones.every((m) => m.completed);
    if (allDone) {
      goal.status = 'Completed';
    } else if (goal.status === 'Completed' && !milestone.completed) {
      goal.status = 'In Progress';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated.',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized.',
      });
    }

    // Detach linked assignments
    await Assignment.updateMany(
      { user: req.user._id, goalId: req.params.id },
      { $set: { goalId: null, milestoneId: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Goal deleted and linked assignments unlinked.',
    });
  } catch (err) {
    next(err);
  }
};
