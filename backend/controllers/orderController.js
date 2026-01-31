const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  console.log('Creating order with data:', {
    orderItems: orderItems?.map(item => ({ name: item.name, product: item.product, qty: item.qty })),
    paymentMethod,
    totalPrice
  });

  // Validation
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
    res.status(400);
    throw new Error('Please provide complete shipping address');
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error('Please select a payment method');
  }

  // Verify products exist and have sufficient stock
  for (let item of orderItems) {
    console.log('Checking product with ID:', item.product);
    const product = await Product.findById(item.product);
    if (!product) {
      console.error(`Product not found with ID: ${item.product}, Item name: ${item.name}`);
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }
    console.log(`Product found: ${product.name}, Stock: ${product.countInStock}, Requested: ${item.qty}`);
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice: Number(itemsPrice),
    taxPrice: Number(taxPrice),
    shippingPrice: Number(shippingPrice),
    totalPrice: Number(totalPrice),
  });

  const createdOrder = await order.save();
  const populatedOrder = await Order.findById(createdOrder._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name price image');

  // Update product stock and purchase count
  for (let item of orderItems) {
    const product = await Product.findById(item.product);
    product.countInStock -= item.qty;
    // Increment numPurchases for successful order
    product.numPurchases = (product.numPurchases || 0) + item.qty;
    await product.save();
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: populatedOrder,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const count = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.product', 'name price image')
    .sort({ [sortBy]: sortOrder })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name price image');

  if (order) {
    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      order,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Admin only functions

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Filter options
  const filter = {};
  if (req.query.status) {
    if (req.query.status === 'paid') {
      filter.isPaid = true;
    } else if (req.query.status === 'unpaid') {
      filter.isPaid = false;
    } else if (req.query.status === 'delivered') {
      filter.isDelivered = true;
    } else if (req.query.status === 'pending') {
      filter.isDelivered = false;
    }
  }

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name price image')
    .sort({ [sortBy]: sortOrder })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { action } = req.body;

  if (!action) {
    res.status(400);
    throw new Error('Please specify an action (markPaid, markDelivered)');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    if (action === 'markPaid') {
      if (order.isPaid) {
        res.status(400);
        throw new Error('Order is already paid');
      }
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.paymentId || 'admin_payment',
        status: 'completed',
        update_time: new Date().toISOString(),
        email_address: order.user.email || 'admin@shopkart.com',
      };
    } else if (action === 'markDelivered') {
      if (!order.isPaid) {
        res.status(400);
        throw new Error('Order must be paid before marking as delivered');
      }
      if (order.isDelivered) {
        res.status(400);
        throw new Error('Order is already delivered');
      }
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      res.status(400);
      throw new Error('Invalid action. Use markPaid or markDelivered');
    }

    const updatedOrder = await order.save();
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');

    res.json({
      success: true,
      message: `Order ${action === 'markPaid' ? 'marked as paid' : 'marked as delivered'} successfully`,
      order: populatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = asyncHandler(async (req, res) => {
  console.log('DELETE order request received for ID:', req.params.id);
  
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns this order or is admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this order');
  }

  // Only allow deletion of orders that are not paid and not delivered
  if (order.isPaid) {
    res.status(400);
    throw new Error('Cannot delete order that has been paid');
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error('Cannot delete order that has been delivered');
  }

  // Restore product stock before deleting the order
  for (let item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.qty;
      await product.save();
    }
  }

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Order deleted successfully',
  });
});

// @desc    Update order to paid (for payment integrations)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error('Order is already paid');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save();
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');

    res.json({
      success: true,
      message: 'Order paid successfully',
      order: populatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
  deleteOrder,
};