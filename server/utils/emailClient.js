const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your app password (not your email password)
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"TimberZee Shop" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent blocking main flow, just log it
    // dependent on importance, maybe we want to throw.
    // For now, let's just log.
  }
};

const getWishlistTemplate = (product, user) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #000; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">TIMBERZEE</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Great Pick, ${user.firstName || 'there'}!</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          You've added <strong>${product.name}</strong> to your wishlist. We know you have great taste!
        </p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
           ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; max-height: 200px; border-radius: 4px; margin-bottom: 15px;">` : ''}
           <h3 style="margin: 0; color: #000;">${product.name}</h3>
           <p style="color: #e74c3c; font-weight: bold; font-size: 18px; margin: 10px 0;">${product.price} EGP</p>
        </div>

        <p style="color: #666; border-left: 4px solid #2ecc71; padding-left: 15px;">
          <strong>Pro Tip:</strong> We'll keep an eye on this item for you. Stay tuned for exclusive promos, flash sales, and price drops sent directly to this email!
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/wishlist" style="background-color: #000; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">Go to My Wishlist</a>
        </div>
      </div>
      
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} TimberZee. All rights reserved.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    </div>
  `;
};

const getAdminOrderTemplate = (order, customer) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <span style="color: #888; font-size: 12px;">Qty: ${item.qty}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.price} EGP
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #333; border-radius: 0px; box-shadow: 5px 5px 0px rgba(0,0,0,0.1);">
      <div style="background-color: #000; padding: 20px; text-align: center;">
        <p style="color: #f1c40f; margin: 0; font-weight: bold; font-size: 14px; text-transform: uppercase;">New Order Alert</p>
        <h1 style="color: #fff; margin: 5px 0 0 0; font-size: 22px;">Order #${order._id.toString().slice(-6).toUpperCase()}</h1>
      </div>
      
      <div style="padding: 30px;">
        <div style="margin-bottom: 30px;">
          <h3 style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">Customer Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.firstName} ${customer.lastName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${customer.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer.phoneNumber || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
        </div>

        <div style="margin-bottom: 30px;">
             <h3 style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">Order Summary</h3>
             <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                   <td style="padding: 15px 10px; text-align: right;"><strong>Subtotal</strong></td>
                   <td style="padding: 15px 10px; text-align: right;">${order.itemsPrice} EGP</td>
                </tr>
                <tr>
                   <td style="padding: 5px 10px; text-align: right;"><strong>Shipping</strong></td>
                   <td style="padding: 5px 10px; text-align: right;">${order.shippingPrice} EGP</td>
                </tr>
                 <tr>
                   <td style="padding: 15px 10px; text-align: right; border-top: 2px solid #000; font-size: 18px;"><strong>Total</strong></td>
                   <td style="padding: 15px 10px; text-align: right; border-top: 2px solid #000; font-size: 18px; color: #27ae60;">${order.totalPrice} EGP</td>
                </tr>
             </table>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/order/${order._id}" style="background-color: #000; color: #fff; text-decoration: none; padding: 15px 30px; display: inline-block; font-weight: bold; text-transform: uppercase;">View Order in Admin Panel</a>
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  sendEmail,
  getWishlistTemplate,
  getAdminOrderTemplate
};
