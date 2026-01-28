// Order Status Email Templates

const getEmailHeader = () => `
  <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(18, 52, 77, 0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #12344D 0%, #1a4d6f 100%); padding: 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
          <span style="color: #E58F14;">Merk</span> Order Update
        </h1>
      </td>
    </tr>
`;

const getEmailFooter = () => `
    <tr>
      <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
          <strong style="color: #12344D;">Merk</strong> - Your Premium Shopping Destination
        </p>
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Merk. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
`;

// 1. Order Received Email (Immediately after order placement)
const orderReceivedTemplate = ({ name, orderId, orderTotal, orderDate, currencySymbol = '$' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            ✓ Order Received
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">Hello ${name}! 👋</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Thank you for your order! We've received your order and will start processing it shortly.
        </p>

        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #12344D; font-size: 18px;">📦 Order Details</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Order ID:</td>
              <td style="padding: 8px 0; color: #12344D; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Order Date:</td>
              <td style="padding: 8px 0; color: #12344D; font-weight: 600; text-align: right;">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Total Amount:</td>
              <td style="padding: 8px 0; color: #E58F14; font-weight: 700; font-size: 18px; text-align: right;">${currencySymbol}${orderTotal}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>What's Next?</strong><br>
            We'll send you another email once we start preparing your order.
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          Questions? Contact us at <a href="mailto:merkapp25@gmail.com" style="color: #E58F14;">merkapp25@gmail.com</a>
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

// 2. Order Preparing Email
const orderPreparingTemplate = ({ name, orderId, estimatedTime = '1-2 business days' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            📦 Preparing Your Order
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">Great News, ${name}! 🎉</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          We're now preparing your order for shipment. Our team is carefully packing your items to ensure they arrive in perfect condition.
        </p>

        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 18px;">📋 Order Status</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #1e3a8a;">Order ID:</td>
              <td style="padding: 8px 0; color: #1e40af; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #1e3a8a;">Status:</td>
              <td style="padding: 8px 0; color: #3b82f6; font-weight: 600; text-align: right;">Preparing</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #1e3a8a;">Estimated Shipping:</td>
              <td style="padding: 8px 0; color: #1e40af; font-weight: 600; text-align: right;">${estimatedTime}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">2</div>
            <div style="width: 60px; height: 3px; background-color: #e5e7eb;"></div>
            <div style="width: 30px; height: 30px; background-color: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-center; color: #9ca3af; font-weight: bold;">3</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #64748b;">
            <span>Received</span>
            <span style="color: #3b82f6; font-weight: 600;">Preparing</span>
            <span>Shipped</span>
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          We'll notify you as soon as your order ships!
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

// 3. Order Shipped Email
const orderShippedTemplate = ({ name, orderId, trackingNumber = 'N/A', estimatedDelivery = '2-3 business days' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            🚚 Order Shipped
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">Your Order is On Its Way, ${name}! 📦</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Good news! Your order has been shipped and is on its way to you. You can expect delivery soon.
        </p>

        <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-left: 4px solid #8b5cf6; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #6b21a8; font-size: 18px;">🚚 Shipping Details</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #5b21b6;">Order ID:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5b21b6;">Tracking Number:</td>
              <td style="padding: 8px 0; color: #8b5cf6; font-weight: 600; text-align: right;">${trackingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5b21b6;">Estimated Delivery:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-weight: 600; text-align: right;">${estimatedDelivery}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #8b5cf6;"></div>
            <div style="width: 30px; height: 30px; background-color: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">3</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #64748b;">
            <span>Received</span>
            <span>Prepared</span>
            <span style="color: #8b5cf6; font-weight: 600;">Shipped</span>
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          We'll notify you when your order is out for delivery!
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

// 4. Out for Delivery Email
const outForDeliveryTemplate = ({ name, orderId, deliveryTime = 'today' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            🚴 Out for Delivery
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">Almost There, ${name}! 🎯</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Your order is out for delivery and will arrive soon. Please ensure someone is available to receive the package.
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #92400e; font-size: 18px;">🚴 Delivery Information</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Order ID:</td>
              <td style="padding: 8px 0; color: #92400e; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Status:</td>
              <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; text-align: right;">Out for Delivery</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Expected Delivery:</td>
              <td style="padding: 8px 0; color: #92400e; font-weight: 600; text-align: right;">${deliveryTime}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #f59e0b;"></div>
            <div style="width: 30px; height: 30px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">4</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #64748b;">
            <span>Received</span>
            <span>Prepared</span>
            <span>Shipped</span>
            <span style="color: #f59e0b; font-weight: 600;">Out for Delivery</span>
          </div>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>📍 Delivery Tip:</strong><br>
            Please keep your phone handy. Our delivery partner may call you for directions.
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          Thank you for shopping with Merk!
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

// 5. Order Delivered Email (with proof image)
const orderDeliveredTemplate = ({ name, orderId, deliveryDate, proofImage = null }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            ✓ Delivered Successfully
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">Delivered, ${name}! 🎉</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Great news! Your order has been successfully delivered. We hope you love your purchase!
        </p>

        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">✓ Delivery Confirmation</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #047857;">Order ID:</td>
              <td style="padding: 8px 0; color: #065f46; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857;">Delivered On:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600; text-align: right;">${deliveryDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857;">Status:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 700; text-align: right;">DELIVERED ✓</td>
            </tr>
          </table>
        </div>

        ${proofImage ? `
        <div style="margin: 25px 0; text-align: center;">
          <h3 style="color: #12344D; font-size: 16px; margin: 0 0 15px;">📸 Delivery Proof</h3>
          <img src="${proofImage}" alt="Delivery Proof" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 10px; color: #10b981; font-weight: 600;">
            <span>Received</span>
            <span>Prepared</span>
            <span>Shipped</span>
            <span>Out for Delivery</span>
            <span>Delivered</span>
          </div>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>💬 We'd Love Your Feedback!</strong><br>
            How was your experience? Please take a moment to rate your purchase.
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          Thank you for choosing Merk! We hope to serve you again soon. 💙
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

module.exports = {
  orderReceivedTemplate,
  orderPreparingTemplate,
  orderShippedTemplate,
  outForDeliveryTemplate,
  orderDeliveredTemplate
};
