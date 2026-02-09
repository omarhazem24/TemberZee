const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendWhatsAppMessage } = require('../utils/whatsappClient');
const { sendEmail, getAdminOrderTemplate } = require('../utils/emailClient');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    coupon,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Calculate Shipping
    let calculatedShippingPrice = 120; // Default
    const gov = shippingAddress.state || ''; // Using state field for governorate
    
    const zone90 = ['Alexandria', 'Beheira', 'Kafr El Sheikh', 'Kafr El-Sheikh', 'Gharbia', 'Monufia', 'Suez', 'Qalyubia', 'Dakahlia', 'Sharqia', 'Damietta', 'Port Said', 'Ismailia', 'Matruh'];
    const zone70 = ['Cairo', 'Giza'];

    // Normalize for comparison
    const govNormal = gov.trim();

    if (zone70.some(z => govNormal.toLowerCase() === z.toLowerCase())) {
        calculatedShippingPrice = 70;
    } else if (zone90.some(z => govNormal.toLowerCase() === z.toLowerCase())) {
        calculatedShippingPrice = 90;
    }

    // Force tax to 0
    const finalTaxPrice = 0;

    // Recalculate total price
    let adjustedTotalPrice = Number(itemsPrice) + finalTaxPrice + calculatedShippingPrice;

    adjustedTotalPrice = adjustedTotalPrice.toFixed(2);

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice: finalTaxPrice,
      shippingPrice: calculatedShippingPrice,
      totalPrice: adjustedTotalPrice,
    });

    const createdOrder = await order.save();

    // Increment saleSold for products on sale
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.isSaleActive) {
        product.saleSold = (product.saleSold || 0) + item.qty;
        await product.save();
      }
    }

    // Send Email to Admin
    try {
        const adminEmail = 'timberzee3@gmail.com'; 
        const html = getAdminOrderTemplate(createdOrder, req.user);
        sendEmail(adminEmail, `New Order Received #${createdOrder._id}`, html);
    } catch (emailError) {
        console.error('Failed to send admin email:', emailError);
    }

    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'firstName lastName email phoneNumber'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id firstName lastName')
    .sort({ createdAt: 1 }); // Oldest first (FIFO Priority)
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status, shippingFee } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName countryCode phoneNumber');

  if (order) {
     if (order.orderStatus === 'delivered' && status === 'canceled') {
         res.status(400);
         throw new Error('A delivered order cannot be canceled');
     }

     if (status === 'confirmed') {
         if (order.user && order.user.phoneNumber) {
             const countryCode = order.user.countryCode || '+20';
             const phoneNumber = order.user.phoneNumber;
             const fullNumber = `${countryCode}${phoneNumber}`;
             
             const message = `Hello ${order.user.firstName},
Your order #${order._id} has been confirmed!

*Receipt:*
${order.orderItems.map(item => `- ${item.name} x${item.qty}: ${item.price.toFixed(2)} EGP`).join('\n')}

*Breakdown:*
Items Total: ${order.itemsPrice.toFixed(2)} EGP
Tax: ${order.taxPrice.toFixed(2)} EGP
Shipping: ${order.shippingPrice.toFixed(2)} EGP
----------------
*Total: ${order.totalPrice} EGP*

Estimated Arrival: 3-5 business days.

Thank you for shopping with us!`;
 
             sendWhatsAppMessage(fullNumber, message);
         }
     }

     if (status === 'canceled') {
         if (order.user && order.user.phoneNumber) {
             const countryCode = order.user.countryCode || '+20';
             const phoneNumber = order.user.phoneNumber;
             const fullNumber = `${countryCode}${phoneNumber}`;
             
             const message = `Hello ${order.user.firstName},
Per your request, your order #${order._id} has been canceled.

If you have any questions or did not request this cancellation, please contact us immediately.

Thank you.`;
             sendWhatsAppMessage(fullNumber, message);
         }
     }

     order.orderStatus = status;

     if (status === 'delivered') {
         order.isDelivered = true;
         order.deliveredAt = Date.now();
     } else {
         order.isDelivered = false;
         order.deliveredAt = null;
     }
     
     if (status === 'confirmed' || status === 'delivered') {
          // You might check if already confirmed etc.
          // For now just update status
     }

     const updatedOrder = await order.save();
     res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Request order cancellation
// @route   POST /api/orders/:id/cancel
// @access  Private
const requestOrderCancellation = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

  if (order) {
    // Check ownership
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
       res.status(401);
       throw new Error('Not authorized to cancel this order');
    }

    if (order.isDelivered) {
        res.status(400);
        throw new Error('Cannot cancel a delivered order');
    }

    // Send Email to Admin
    try {
        const adminEmail = 'timberzee3@gmail.com'; 
        const subject = `Cancellation Request for Order #${order._id}`;
        const html = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">Order Cancellation Request</h2>
            <p>Customer <strong>${order.user.firstName} ${order.user.lastName}</strong> (<a href="mailto:${order.user.email}">${order.user.email}</a>) has requested to cancel their order.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> #${order._id}</p>
                <p><strong>Total Amount:</strong> ${order.totalPrice} EGP</p>
                <p><strong>Current Status:</strong> ${order.orderStatus || 'Pending'}</p>
            </div>
            <p>Please review this request in the admin panel.</p>
          </div>
        `;
        
        sendEmail(adminEmail, subject, html);
        
        res.json({ message: 'Cancellation request sent to admin' });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Failed to send cancellation email');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
const getOrderAnalytics = async (req, res) => {
  try {
    // 1. Total Revenue & Orders Count (Only paid or delivered/confirmed if payment isn't strictly tracked via isPaid)
    // Assuming confirmed/delivered counts as revenue for COD model or isPaid for online
    const orders = await Order.find({ 
      orderStatus: { $nin: ['canceled'] } // Exclude canceled
    });

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const totalOrders = orders.length;
    
    // 2. Total Products Sold
    const totalProductsSold = orders.reduce((acc, order) => {
       return acc + order.orderItems.reduce((acc2, item) => acc2 + item.qty, 0);
    }, 0);

    // 3. Status Breakdown
    const statusCounts = orders.reduce((acc, order) => {
        const status = order.orderStatus || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // 4. Highest Selling Products
    const productSales = {};
    for(const order of orders) {
       for(const item of order.orderItems) {
           const id = item.product.toString();
           if (!productSales[id]) {
               productSales[id] = {
                   name: item.name,
                   qty: 0,
                   revenue: 0,
                   image: item.image
               };
           }
           productSales[id].qty += item.qty;
           productSales[id].revenue += item.qty * item.price;
       }
    }

    // Convert object to sorted array
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5); // Top 5

    res.json({
        totalRevenue,
        totalOrders,
        totalProductsSold,
        statusCounts,
        topProducts
    });

  } catch (error) {
     res.status(500);
     throw new Error('Analytics Calculation Failed: ' + error.message);
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  requestOrderCancellation,
  getOrderAnalytics,
};
