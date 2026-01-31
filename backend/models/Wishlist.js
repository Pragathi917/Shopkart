const mongoose = require('mongoose');

const wishlistItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

const wishlistSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;