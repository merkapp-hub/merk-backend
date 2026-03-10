const https = require('https');

class OneSignalService {
  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID;
    this.apiUrl = 'https://onesignal.com/api/v1/notifications';
  }

  async sendNotification(userIds, title, message, data = {}) {
    try {
      if (!this.appId) {
        console.error('OneSignal App ID not configured');
        return { success: false, error: 'App ID not configured' };
      }

      const payload = {
        app_id: this.appId,
        include_external_user_ids: Array.isArray(userIds) ? userIds : [userIds],
        headings: { en: title },
        contents: { en: message },
        data: data
      };

      const postData = JSON.stringify(payload);

      const options = {
        hostname: 'onesignal.com',
        port: 443,
        path: '/api/v1/notifications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };

      return new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            try {
              const parsedData = JSON.parse(responseData);
              console.log(`OneSignal notification sent to users: ${userIds}`);
              resolve({ success: true, data: parsedData });
            } catch (parseError) {
              console.error('OneSignal response parse error:', parseError);
              resolve({ success: false, error: 'Invalid response format' });
            }
          });
        });

        req.on('error', (error) => {
          console.error('OneSignal API Error:', error.message);
          resolve({ success: false, error: error.message });
        });

        req.on('timeout', () => {
          req.destroy();
          console.error('OneSignal API timeout');
          resolve({ success: false, error: 'Request timeout' });
        });

        req.write(postData);
        req.end();
      });

    } catch (error) {
      console.error('OneSignal API Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async orderReceived(order, user) {
    return this.sendNotification(
      user._id.toString(),
      'Order Received!',
      `Your order #${order.orderId} has been received and is being processed.`,
      {
        type: 'order_received',
        orderId: order.orderId,
        orderTotal: order.total
      }
    );
  }

  async orderStatusChanged(order, user, newStatus) {
    const statusMessages = {
      'SellerApproved': 'Your order has been approved by the seller',
      'Preparing': 'Your order is being prepared',
      'Shipped': 'Your order has been shipped',
      'OutForDelivery': 'Your order is out for delivery',
      'Delivered': 'Your order has been delivered'
    };

    return this.sendNotification(
      user._id.toString(),
      'Order Update',
      `Order #${order.orderId}: ${statusMessages[newStatus] || `Status updated to ${newStatus}`}`,
      {
        type: 'order_status_changed',
        orderId: order.orderId,
        status: newStatus
      }
    );
  }

  async orderCancelled(order, user, reason = null) {
    return this.sendNotification(
      user._id.toString(),
      'Order Cancelled',
      `Your order #${order.orderId} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      {
        type: 'order_cancelled',
        orderId: order.orderId,
        reason: reason
      }
    );
  }

  async orderDelivered(order, user) {
    return this.sendNotification(
      user._id.toString(),
      'Order Delivered!',
      `Your order #${order.orderId} has been successfully delivered. Thank you for shopping with us!`,
      {
        type: 'order_delivered',
        orderId: order.orderId
      }
    );
  }

  async newOrderForSeller(order, seller) {
    return this.sendNotification(
      seller._id.toString(),
      'New Order Received!',
      `You have a new order #${order.orderId} worth $${order.total}`,
      {
        type: 'new_order_seller',
        orderId: order.orderId,
        orderTotal: order.total
      }
    );
  }

  async refundProcessed(order, user, refundAmount) {
    return this.sendNotification(
      user._id.toString(),
      'Refund Processed',
      `Your refund of $${refundAmount} for order #${order.orderId} has been processed.`,
      {
        type: 'refund_processed',
        orderId: order.orderId,
        refundAmount: refundAmount
      }
    );
  }
}

module.exports = new OneSignalService();