const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');

// @desc    Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found - token invalid');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// @desc    Admin middleware - check if user is admin AND approved
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) {
    // Check if admin is approved
    if (req.user.isApproved === false) {
      res.status(403);
      throw new Error('Admin account pending approval');
    }
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// @desc    Super Admin middleware - check if user is super admin
const superAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin === true) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized - Super Admin access required');
  }
};

// @desc    Optional auth - doesn't fail if no token provided
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Optional auth error:', error.message);
      // Don't throw error, just continue without user
    }
  }

  next();
});

module.exports = { protect, admin, superAdmin, optionalAuth };