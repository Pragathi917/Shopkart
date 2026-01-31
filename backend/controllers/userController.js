const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Register a new user (signup)
// @route   POST /api/users/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Professional password validation
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/\d/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one number');
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one special character');
  }

  // Validate role
  if (role && !['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Must be either user or admin');
  }

  // Check if user exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Check if this is the first admin (make them super admin)
  let isSuperAdmin = false;
  let isApproved = true; // Default approved
  
  if (role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      // First admin becomes super admin
      isSuperAdmin = true;
      isApproved = true;
    } else {
      // Subsequent admins need approval
      isApproved = false;
    }
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: role || 'user',
    isApproved,
    isSuperAdmin,
  });

  if (user) {
    // Check if admin account needs approval
    if (user.role === 'admin' && !user.isApproved) {
      res.status(201).json({
        success: true,
        message: 'Admin account created successfully. Please wait for approval from a super administrator.',
        needsApproval: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      });
    } else {
      res.status(201).json({
        success: true,
        message: user.isSuperAdmin ? 'Super Admin account created successfully' : 'User registered successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          isSuperAdmin: user.isSuperAdmin,
          token: generateToken(user._id),
        },
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token (login)
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    // Check if admin account is approved
    if (user.role === 'admin' && !user.isApproved) {
      res.status(403);
      throw new Error('Your admin account is pending approval. Please contact a super administrator.');
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isSuperAdmin: user.isSuperAdmin || false,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update fields if provided
    user.name = req.body.name?.trim() || user.name;
    user.email = req.body.email?.toLowerCase() || user.email;

    // Check if new email already exists
    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: user._id }
      });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use');
      }
    }

    // Update password if provided
    if (req.body.password) {
      // Professional password validation
      if (req.body.password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
      }
      if (!/[A-Z]/.test(req.body.password)) {
        res.status(400);
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(req.body.password)) {
        res.status(400);
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(req.body.password)) {
        res.status(400);
        throw new Error('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(req.body.password)) {
        res.status(400);
        throw new Error('Password must contain at least one special character');
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Admin only functions

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({
    success: true,
    count: users.length,
    users,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Additional check to ensure only super admins can delete users
    if (!req.user.isSuperAdmin) {
      res.status(403);
      throw new Error('Not authorized - Super Admin access required');
    }
    
    // Prevent super admins from deleting other super admins
    if (user.isSuperAdmin && req.user._id.toString() !== user._id.toString()) {
      res.status(400);
      throw new Error('Cannot delete super admin user');
    }
    
    await User.deleteOne({ _id: user._id });
    res.json({ 
      success: true,
      message: 'User removed successfully'
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json({
      success: true,
      user,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    // Update legacy isAdmin field for backward compatibility
    user.isAdmin = user.role === 'admin';

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Approve admin user
// @route   PUT /api/users/:id/approve
// @access  Private/SuperAdmin
const approveAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role !== 'admin') {
      res.status(400);
      throw new Error('User is not an admin');
    }

    user.isApproved = true;
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: `Admin ${updatedUser.name} has been approved`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Revoke admin approval (for already approved admins)
// @route   PUT /api/users/:id/revoke
// @access  Private/SuperAdmin
const revokeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isSuperAdmin) {
      res.status(400);
      throw new Error('Cannot revoke super admin privileges');
    }

    user.isApproved = false;
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: `Admin privileges revoked for ${updatedUser.name}`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reject admin request (convert back to regular user)
// @route   PUT /api/users/:id/reject
// @access  Private/SuperAdmin
const rejectAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isSuperAdmin) {
      res.status(400);
      throw new Error('Cannot reject super admin');
    }

    // Convert back to regular user
    user.role = 'user';
    user.isApproved = true; // Users are auto-approved
    user.isAdmin = false;
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: `Admin request rejected. ${updatedUser.name} is now a regular user`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get pending admin approvals
// @route   GET /api/users/pending-admins
// @access  Private/SuperAdmin
const getPendingAdmins = asyncHandler(async (req, res) => {
  // Use $ne instead of direct false comparison due to Mongoose default function behavior
  const pendingAdmins = await User.find({ 
    role: 'admin', 
    isApproved: { $ne: true }
  }).select('-password');
  
  // Filter to only show those who are actually pending (not the super admin)
  const actuallyPending = pendingAdmins.filter(admin => !admin.isSuperAdmin);
  
  res.json({
    success: true,
    count: actuallyPending.length,
    pendingAdmins: actuallyPending,
  });
});

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  approveAdmin,
  revokeAdmin,
  rejectAdmin,
  getPendingAdmins,
};