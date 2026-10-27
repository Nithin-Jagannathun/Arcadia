import Assignment from '../models/Assignment.js';
import Goal from '../models/Goal.js';
import Idea from '../models/Idea.js';

// @desc    Get all ideas for user with search and filters
// @route   GET /api/ideas
// @access  Private
export const getIdeas = async (req, res, next) => {
  try {
    const { q, category, status, tag } = req.query;
    const query = { user: req.user._id };

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.planningStatus = status;
    }

    if (tag && tag.trim()) {
      query.tags = tag.trim();
    }

    // Always sort pinned first, then newest
    const ideas = await Idea.find(query).sort({ pinned: -1, updatedAt: -1 });
    const categories = await Idea.distinct('category', { user: req.user._id });
    const allTags = await Idea.distinct('tags', { user: req.user._id });

    res.status(200).json({
      success: true,
      data: ideas,
      categories: categories.filter(Boolean),
      tags: allTags.filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new idea
// @route   POST /api/ideas
// @access  Private
export const createIdea = async (req, res, next) => {
  try {
    const { title, description, category, tags, planningStatus, pinned } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Idea title is required.',
      });
    }

    const processedTags = Array.isArray(tags)
      ? tags.map((t) => t.trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const idea = await Idea.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General',
      tags: processedTags,
      planningStatus: planningStatus || 'Brainstorming',
      pinned: Boolean(pinned),
    });

    res.status(201).json({
      success: true,
      message: 'Idea created successfully.',
      data: idea,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update idea
// @route   PUT /api/ideas/:id
// @access  Private
export const updateIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found or unauthorized.',
      });
    }

    const { title, description, category, tags, planningStatus, pinned } = req.body;

    if (title !== undefined) idea.title = title.trim();
    if (description !== undefined) idea.description = description.trim();
    if (category !== undefined) idea.category = category.trim();
    if (planningStatus !== undefined) idea.planningStatus = planningStatus;
    if (pinned !== undefined) idea.pinned = Boolean(pinned);

    if (tags !== undefined) {
      idea.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    }

    await idea.save();

    res.status(200).json({
      success: true,
      message: 'Idea updated successfully.',
      data: idea,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete idea
// @route   DELETE /api/ideas/:id
// @access  Private
export const deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Idea deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Convert idea into assignment or goal
// @route   POST /api/ideas/:id/convert
// @access  Private
export const convertIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found.',
      });
    }

    const { targetType, course, deadline, priority, category } = req.body;

    let createdEntity = null;

    if (targetType === 'assignment') {
      const defaultDeadline = deadline
        ? new Date(deadline)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      createdEntity = await Assignment.create({
        user: req.user._id,
        title: idea.title,
        description: idea.description,
        course: course || idea.category || 'General',
        deadline: defaultDeadline,
        priority: priority || 'Medium',
        status: 'Not Started',
        type: 'Individual',
      });
    } else if (targetType === 'goal') {
      createdEntity = await Goal.create({
        user: req.user._id,
        title: idea.title,
        description: idea.description,
        category: category || (['Academics', 'Career', 'Personal', 'Projects'].includes(idea.category) ? idea.category : 'Custom'),
        startDate: new Date(),
        targetDate: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        milestones: [
          {
            title: `Kickoff: ${idea.title}`,
            description: 'Initial planning and requirements breakdown',
            completed: false,
          },
        ],
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "targetType must be either 'assignment' or 'goal'",
      });
    }

    // Update idea's status to Planned
    idea.planningStatus = 'Planned';
    await idea.save();

    res.status(201).json({
      success: true,
      message: `Idea successfully converted to ${targetType}!`,
      targetType,
      createdEntity,
      idea,
    });
  } catch (err) {
    next(err);
  }
};
