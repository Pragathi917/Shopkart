const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
      default: '/images/sample.jpg',
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      required: false,
      trim: true,
    },
    countInStock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Number of reviews cannot be negative'],
    },
    numPurchases: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Number of purchases cannot be negative'],
      description: 'Total number of successful purchases of this product',
    },
    // Additional fields for better product management
    brand: {
      type: String,
      required: false,
      trim: true,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;