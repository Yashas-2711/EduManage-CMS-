'use strict';

const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse, createError } = require('../utils/helpers');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw createError('Name, email and password are required.', 400);
  }

  // Check for existing user
  const existing = await User.findOne({ where: { email } });
  if (existing) throw createError('Email is already registered.', 409);

  // Create user (password hashed via model hook)
  const user = await User.create({ name, email, password, role });

  const token = generateToken({ id: user.id, role: user.role });

  return res.status(201).json({
    ...successResponse({ user, token }, 'Registration successful'),
  });
});

/**
 * @desc    Login and get JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw createError('Email and password are required.', 400);

  // Find user (include password for comparison)
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError('Invalid credentials.', 401);

  if (!user.isActive) throw createError('Your account has been deactivated.', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw createError('Invalid credentials.', 401);

  const token = generateToken({ id: user.id, role: user.role });

  return res.status(200).json({
    ...successResponse({ user, token }, 'Login successful'),
  });
});

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(successResponse(req.user));
});

/**
 * @desc    Update logged-in user password
 * @route   PUT /api/v1/auth/change-password
 * @access  Protected
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw createError('Current and new password are required.', 400);
  }
  if (newPassword.length < 6) throw createError('Password must be at least 6 characters.', 400);

  const user = await User.findByPk(req.user.id);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw createError('Current password is incorrect.', 401);

  user.password = newPassword;
  await user.save();

  return res.status(200).json(successResponse(null, 'Password updated successfully'));
});

module.exports = { register, login, getMe, changePassword };
