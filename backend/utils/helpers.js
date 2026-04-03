'use strict';

/**
 * Helper to build Sequelize pagination options from query params.
 * @param {object} query - req.query
 * @returns {{ limit, offset, page }}
 */
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100); // cap at 100
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};

/**
 * Build a standard paginated response envelope.
 */
const paginatedResponse = (data, count, page, limit) => ({
  success: true,
  pagination: {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  },
  data,
});

/**
 * Build a simple success response envelope.
 */
const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

/**
 * Generate error with custom status code.
 */
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { getPagination, paginatedResponse, successResponse, createError };
