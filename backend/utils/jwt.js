'use strict';

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token.
 * @param {object} payload - Data to embed in the token
 * @returns {string} Signed token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { generateToken };
