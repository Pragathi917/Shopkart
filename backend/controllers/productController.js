const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const Order = require('../models/Order.js');

// @desc    Get all products with pagination and search
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Search functionality
  const keyword = req.query.keyword ? {
    $or: [
      {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      },
      {
        description: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      },
      {
        category: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      },
    ],
  } : {};

  // Category filter
  const categoryFilter = req.query.category ? {
    category: {
      $regex: req.query.category,
      $options: 'i',
    },
  } : {};

  // Price range filter
  const priceFilter = {};
  if (req.query.minPrice) {
    priceFilter.price = { ...priceFilter.price, $gte: Number(req.query.minPrice) };
  }
  if (req.query.maxPrice) {
    priceFilter.price = { ...priceFilter.price, $lte: Number(req.query.maxPrice) };
  }

  // Combine all filters
  const filter = { ...keyword, ...categoryFilter, ...priceFilter };

  const count = await Product.countDocuments(filter);
  let products = await Product.find(filter)
    .populate('user', 'name email')
    .sort({ [sortBy]: sortOrder })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Get purchase counts from paid orders for each product
  products = products.map(product => {
    const productObj = product.toObject();
    return {
      ...productObj,
      // Use the stored numPurchases field, or calculate from orders if not set
      numPurchases: product.numPurchases || 0
    };
  });

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    count,
    pageSize,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('user', 'name email')
    .populate('reviews.user', 'name');

  if (product) {
    // Get purchase count from paid orders
    const purchaseCount = product.numPurchases || 0;
    
    // Convert to plain object and add numPurchases
    const productObj = product.toObject();
    productObj.numPurchases = purchaseCount;
    
    res.json({
      success: true,
      product: productObj,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category,
    countInStock,
    brand,
  } = req.body;

  // Validation
  if (!name || !description || !price || !category) {
    res.status(400);
    throw new Error('Please provide all required fields: name, description, price, category');
  }

  if (price < 0) {
    res.status(400);
    throw new Error('Price cannot be negative');
  }

  if (countInStock < 0) {
    res.status(400);
    throw new Error('Stock count cannot be negative');
  }

  const product = new Product({
    user: req.user._id,
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    image: image || '/images/sample.jpg',
    category: category.trim(),
    countInStock: Number(countInStock) || 0,
    brand: brand?.trim() || '',
    rating: 0,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  const populatedProduct = await Product.findById(createdProduct._id)
    .populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product: populatedProduct,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category,
    countInStock,
    brand,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Validation
    if (price && price < 0) {
      res.status(400);
      throw new Error('Price cannot be negative');
    }

    if (countInStock && countInStock < 0) {
      res.status(400);
      throw new Error('Stock count cannot be negative');
    }

    // Update fields if provided
    product.name = name?.trim() || product.name;
    product.description = description?.trim() || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.image = image || product.image;
    product.category = category?.trim() || product.category;
    product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
    product.brand = brand?.trim() || product.brand;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate('user', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: populatedProduct,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please provide rating and comment');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed by this user');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 3;
  const products = await Product.find({})
    .populate('user', 'name email')
    .sort({ rating: -1 })
    .limit(limit);

  res.json({
    success: true,
    products,
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({
    success: true,
    categories,
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
};