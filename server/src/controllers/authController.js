import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'arcadia_super_secret_jwt_key_2026_xyz987';
  return jwt.sign({ id }, secret, {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        deadlineWarningDays: user.deadlineWarningDays,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      deadlineWarningDays: 3,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      deadlineWarningDays: req.user.deadlineWarningDays,
      theme: req.user.theme,
      createdAt: req.user.createdAt,
    },
  });
};

// @desc    Update user profile & settings
// @route   PUT /api/auth/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const { name, deadlineWarningDays, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (deadlineWarningDays !== undefined) {
      const days = parseInt(deadlineWarningDays, 10);
      if (isNaN(days) || days < 1 || days > 30) {
        return res.status(400).json({
          success: false,
          message: 'Deadline warning window must be an integer between 1 and 30 days.',
        });
      }
      user.deadlineWarningDays = days;
    }
    if (theme && ['dark', 'light', 'system'].includes(theme)) {
      user.theme = theme;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        deadlineWarningDays: user.deadlineWarningDays,
        theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
};
