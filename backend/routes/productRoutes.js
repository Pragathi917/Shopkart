const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Public routes
router.get('/', getAllProducts);
router.get('/top', getTopProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Protected routes (user must be logged in)
router.post('/:id/reviews', protect, createProductReview);

// Admin only routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;