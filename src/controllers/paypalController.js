const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { client } = require('@config/paypal');
const Product = require('@models/Product');

// Create PayPal Order
exports.createOrder = async (req, res) => {
  try {
    const { items, total, shipping_address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Cart items are required'
      });
    }

    // Calculate item total
    const itemTotal = items.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.qty));
    }, 0);

    console.log('Items:', items);
    console.log('Item Total Calculated:', itemTotal.toFixed(2));
    console.log('Total Received:', total.toFixed(2));

    // Build purchase units
    const purchase_units = [{
      amount: {
        currency_code: 'USD',
        value: total.toFixed(2)
      },
      description: 'Order from Merk Store',
      shipping: shipping_address ? {
        name: {
          full_name: shipping_address.firstName
        },
        address: {
          address_line_1: shipping_address.address,
          admin_area_2: shipping_address.city,
          postal_code: shipping_address.pinCode,
          country_code: shipping_address.country?.value || 'US'
        }
      } : undefined
    }];

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: purchase_units,
      application_context: {
        brand_name: 'Merk Store',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
      }
    });

    const order = await client().execute(request);

    res.json({
      status: true,
      orderId: order.result.id,
      data: order.result,
      approvalUrl: order.result.links?.find(link => link.rel === 'approve')?.href
    });

  } catch (error) {
    console.error('PayPal Create Order Error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to create PayPal order',
      error: error.message
    });
  }
};

// Capture PayPal Order
exports.captureOrder = async (req, res) => {
  try {
    const { orderID, orderData } = req.body;

    if (!orderID) {
      return res.status(400).json({
        status: false,
        message: 'Order ID is required'
      });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client().execute(request);

    if (capture.result.status === 'COMPLETED') {
      
      
      res.json({
        status: true,
        message: 'Payment completed successfully',
        data: capture.result,
        captureId: capture.result.id
      });
    } else {
      res.status(400).json({
        status: false,
        message: 'Payment not completed',
        data: capture.result
      });
    }

  } catch (error) {
    console.error('PayPal Capture Order Error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to capture PayPal payment',
      error: error.message
    });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderID } = req.params;

    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);
    const order = await client().execute(request);

    res.json({
      status: true,
      data: order.result
    });

  } catch (error) {
    console.error('PayPal Get Order Error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to get order details',
      error: error.message
    });
  }
};

// Refund Payment
exports.refundPayment = async (req, res) => {
  try {
    const { captureId, amount } = req.body;

    if (!captureId) {
      return res.status(400).json({
        status: false,
        message: 'Capture ID is required'
      });
    }

    const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId);
    request.requestBody({
      amount: {
        currency_code: 'USD',
        value: amount.toFixed(2)
      }
    });

    const refund = await client().execute(request);

    res.json({
      status: true,
      message: 'Refund processed successfully',
      data: refund.result
    });

  } catch (error) {
    console.error('PayPal Refund Error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};
