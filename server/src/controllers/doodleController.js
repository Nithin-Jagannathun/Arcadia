import Doodle from '../models/Doodle.js';

// @desc    Get all doodles for user
// @route   GET /api/doodles
// @access  Private
export const getDoodles = async (req, res, next) => {
  try {
    const doodles = await Doodle.find({ user: req.user._id })
      .select('name gridSize createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: doodles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single doodle by ID with gridData
// @route   GET /api/doodles/:id
// @access  Private
export const getDoodleById = async (req, res, next) => {
  try {
    const doodle = await Doodle.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!doodle) {
      return res.status(404).json({
        success: false,
        message: 'Doodle not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: doodle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save new doodle
// @route   POST /api/doodles
// @access  Private
export const createDoodle = async (req, res, next) => {
  try {
    const { name, gridSize = 16, gridData } = req.body;

    if (!gridData || !Array.isArray(gridData)) {
      return res.status(400).json({
        success: false,
        message: 'Valid gridData array is required.',
      });
    }

    const expectedCells = Number(gridSize) * Number(gridSize);
    if (gridData.length !== expectedCells) {
      return res.status(400).json({
        success: false,
        message: `gridData length (${gridData.length}) must match gridSize (${expectedCells}).`,
      });
    }

    const doodle = await Doodle.create({
      user: req.user._id,
      name: name ? name.trim() : 'Untitled Pixel Art',
      gridSize: Number(gridSize),
      gridData,
    });

    res.status(201).json({
      success: true,
      message: 'Doodle saved successfully.',
      data: doodle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing doodle
// @route   PUT /api/doodles/:id
// @access  Private
export const updateDoodle = async (req, res, next) => {
  try {
    const doodle = await Doodle.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!doodle) {
      return res.status(404).json({
        success: false,
        message: 'Doodle not found or unauthorized.',
      });
    }

    const { name, gridData, gridSize } = req.body;

    if (name) doodle.name = name.trim();
    if (gridSize && [16, 24, 32].includes(Number(gridSize))) {
      doodle.gridSize = Number(gridSize);
    }
    if (gridData && Array.isArray(gridData)) {
      doodle.gridData = gridData;
    }

    await doodle.save();

    res.status(200).json({
      success: true,
      message: 'Doodle updated successfully.',
      data: doodle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete doodle
// @route   DELETE /api/doodles/:id
// @access  Private
export const deleteDoodle = async (req, res, next) => {
  try {
    const doodle = await Doodle.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!doodle) {
      return res.status(404).json({
        success: false,
        message: 'Doodle not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doodle deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
