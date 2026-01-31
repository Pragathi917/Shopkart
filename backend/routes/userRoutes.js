const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController.js');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware.js');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected user routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Admin only routes
router.route('/')
  .get(protect, admin, getAllUsers);

// Super Admin only routes
router.get('/pending-admins', protect, superAdmin, getPendingAdmins);
router.put('/:id/approve', protect, superAdmin, approveAdmin);
router.put('/:id/revoke', protect, superAdmin, revokeAdmin);
router.put('/:id/reject', protect, superAdmin, rejectAdmin);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, superAdmin, deleteUser); // Only super admin can delete users

module.exports = router;