const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User reference is required'],
      ref: 'User',
    },
    orderItems: [
      {
        name: { 
          type: String, 
          required: [true, 'Product name is required'] 
        },
        qty: { 
          type: Number, 
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1']
        },
        image: { 
          type: String, 
          required: [true, 'Product image is required'] 
        },
        price: { 
          type: Number, 
          required: [true, 'Product price is required'],
          min: [0, 'Price cannot be negative']
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, 'Product reference is required'],
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { 
        type: String, 
        required: [true, 'Address is required'],
        trim: true
      },
      city: { 
        type: String, 
        required: [true, 'City is required'],
        trim: true
      },
      postalCode: { 
        type: String, 
        required: [true, 'Postal code is required'],
        trim: true
      },
      country: { 
        type: String, 
        required: [true, 'Country is required'],
        trim: true
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['PayPal', 'Stripe', 'Cash on Delivery', 'Bank Transfer'],
      default: 'PayPal',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: [true, 'Items price is required'],
      default: 0.0,
      min: [0, 'Items price cannot be negative'],
    },
    taxPrice: {
      type: Number,
      required: [true, 'Tax price is required'],
      default: 0.0,
      min: [0, 'Tax price cannot be negative'],
    },
    shippingPrice: {
      type: Number,
      required: [true, 'Shipping price is required'],
      default: 0.0,
      min: [0, 'Shipping price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      default: 0.0,
      min: [0, 'Total price cannot be negative'],
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;