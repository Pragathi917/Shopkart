const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    
    if (!wishlist) {
      // Create a new wishlist if it doesn't exist
      wishlist = new Wishlist({
        user: req.user._id,
        items: []
      });
      await wishlist.save();
    }
    
    res.json({
      success: true,
      wishlist: wishlist.items
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch wishlist');
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        items: []
      });
    }
    
    // Check if item is already in wishlist
    const existingItem = wishlist.items.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }
    
    // Add item to wishlist
    wishlist.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock
    });
    
    const updatedWishlist = await wishlist.save();
    
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: updatedWishlist.items
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500);
      throw new Error('Failed to add product to wishlist');
    }
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }
    
    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
    
    const updatedWishlist = await wishlist.save();
    
    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: updatedWishlist.items
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to remove product from wishlist');
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }
    
    // Clear all items
    wishlist.items = [];
    
    const updatedWishlist = await wishlist.save();
    
    res.json({
      success: true,
      message: 'Wishlist cleared',
      wishlist: updatedWishlist.items
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to clear wishlist');
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};