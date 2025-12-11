const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { client } = require('@config/paypal');
const Product = require('@models/Product');

// Create PayPal Order
exports.createOrder = async (req, res) => {
  try {
    console.log('🟢 [PayPal Backend] Create Order Request Received');
    console.log('🟢 [PayPal Backend] Request Body:', JSON.stringify(req.body, null, 2));
    
    const { items, shipping_address } = req.body;
    let total = Number(req.body.total);

    if (!items || items.length === 0) {
      console.error('❌ [PayPal Backend] No items in cart');
      return res.status(400).json({
        status: false,
        message: 'Cart items are required'
      });
    }

    // Calculate item total
    const itemTotal = items.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.qty));
    }, 0);

    console.log('🟢 [PayPal Backend] Items:', items);
    console.log('🟢 [PayPal Backend] Item Total Calculated:', itemTotal.toFixed(2));
    console.log('🟢 [PayPal Backend] Total Received:', total.toFixed(2));
    console.log('🟢 [PayPal Backend] Shipping Address:', shipping_address);

    // Validate shipping address required fields
    if (shipping_address) {
      if (!shipping_address.pinCode || shipping_address.pinCode.trim() === '') {
        console.error('❌ [PayPal Backend] Pin Code is required');
        return res.status(400).json({
          status: false,
          message: 'Pin Code is required for payment processing'
        });
      }
      if (!shipping_address.address || shipping_address.address.trim() === '') {
        console.error('❌ [PayPal Backend] Address is required');
        return res.status(400).json({
          status: false,
          message: 'Address is required for payment processing'
        });
      }
      if (!shipping_address.city || shipping_address.city.trim() === '') {
        console.error('❌ [PayPal Backend] City is required');
        return res.status(400).json({
          status: false,
          message: 'City is required for payment processing'
        });
      }
    }

    // Calculate shipping (difference between total and item total)
    let shippingCost = Number(total) - itemTotal;
    
    // Ensure shipping cost is not negative
    if (shippingCost < 0) {
      console.log('⚠️ [PayPal Backend] Negative shipping detected, adjusting...');
      console.log('   Item Total:', itemTotal.toFixed(2));
      console.log('   Total:', total.toFixed(2));
      console.log('   Difference:', shippingCost.toFixed(2));
      
      // Adjust: Set shipping to 0 and recalculate total
      shippingCost = 0;
      total = itemTotal;
    }
    
    console.log('🟢 [PayPal Backend] Final Shipping Cost:', shippingCost.toFixed(2));
    console.log('🟢 [PayPal Backend] Final Total:', total.toFixed(2));

    // Build purchase units with proper breakdown
    const purchase_units = [{
      amount: {
        currency_code: 'USD',
        value: total.toFixed(2),
        breakdown: {
          item_total: {
            currency_code: 'USD',
            value: itemTotal.toFixed(2)
          },
          shipping: {
            currency_code: 'USD',
            value: shippingCost.toFixed(2)
          }
        }
      },
      description: 'Order from Merk Store',
      items: items.map(item => ({
        name: item.name,
        unit_amount: {
          currency_code: 'USD',
          value: Number(item.price).toFixed(2)
        },
        quantity: item.qty.toString()
      })),
      shipping: shipping_address ? {
        name: {
          full_name: shipping_address.firstName || 'Customer'
        },
        address: {
          address_line_1: shipping_address.address || 'Address not provided',
          admin_area_2: shipping_address.city || 'City',
          admin_area_1: shipping_address.state?.value || shipping_address.state || '',
          postal_code: shipping_address.pinCode || '00000',
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

    console.log('🟢 [PayPal Backend] Sending request to PayPal...');
    const order = await client().execute(request);

    console.log('✅ [PayPal Backend] Order created successfully');
    console.log('✅ [PayPal Backend] Order ID:', order.result.id);
    console.log('✅ [PayPal Backend] Order Status:', order.result.status);
    console.log('✅ [PayPal Backend] Links:', order.result.links);

    const approvalUrl = order.result.links?.find(link => link.rel === 'approve')?.href;
    console.log('🔗 [PayPal Backend] Approval URL:', approvalUrl);

    res.json({
      status: true,
      orderId: order.result.id,
      data: order.result,
      approvalUrl: approvalUrl
    });

  } catch (error) {
    console.error('❌ [PayPal Backend] Create Order Error:', {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack
    });
    res.status(500).json({
      status: false,
      message: 'Failed to create PayPal order',
      error: error.message,
      details: error.details || error.message
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

// Process Card Payment (In-App)
exports.processCardPayment = async (req, res) => {
  try {
    console.log('🟢 [PayPal Backend] Card Payment Request Received');
    console.log('🟢 [PayPal Backend] Request Body:', JSON.stringify(req.body, null, 2));
    
    const { card, shipping_address, productDetail, total, subtotal, shipping, tax } = req.body;
    const ProductRequest = require('@models/ProductRequest');

    // Validate required fields
    if (!productDetail || productDetail.length === 0) {
      console.error('❌ [PayPal Backend] No products in order');
      return res.status(400).json({
        status: false,
        message: 'Product details are required'
      });
    }

    if (!card || !card.number || !card.expiry || !card.cvv) {
      console.error('❌ [PayPal Backend] Card details missing');
      return res.status(400).json({
        status: false,
        message: 'Card details are required'
      });
    }

    if (!total || isNaN(total) || total <= 0) {
      console.error('❌ [PayPal Backend] Invalid total amount:', total);
      return res.status(400).json({
        status: false,
        message: 'Invalid total amount'
      });
    }

    // Validate card details
    const cardNumber = card.number.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return res.status(400).json({
        status: false,
        message: 'Invalid card number'
      });
    }

    // Parse expiry date
    const [expMonth, expYear] = card.expiry.split('/');
    if (!expMonth || !expYear) {
      return res.status(400).json({
        status: false,
        message: 'Invalid expiry date format. Use MM/YY'
      });
    }

    console.log('🟢 [PayPal Backend] Creating order with card payment...');

    // Generate unique PayPal-Request-Id
    const requestId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🟢 [PayPal Backend] Request ID:', requestId);

    // Create PayPal order with card payment source
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    // Add PayPal-Request-Id header
    request.headers['PayPal-Request-Id'] = requestId;
    
    // Calculate item total
    const itemTotal = productDetail.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.qty || item.quantity || 1));
    }, 0);

    const shippingCost = Number(shipping) || 0;
    const taxAmount = Number(tax) || 0;
    
    // Recalculate total to match breakdown
    const calculatedTotal = itemTotal + shippingCost + taxAmount;
    
    console.log('🟢 [PayPal Backend] Amount Breakdown:', {
      itemTotal: itemTotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: taxAmount.toFixed(2),
      calculatedTotal: calculatedTotal.toFixed(2),
      receivedTotal: Number(total).toFixed(2)
    });

    request.requestBody({
      intent: 'CAPTURE',
      payment_source: {
        card: {
          number: cardNumber,
          expiry: `20${expYear}-${expMonth.padStart(2, '0')}`,
          security_code: card.cvv,
          name: card.name,
          billing_address: {
            address_line_1: shipping_address.address,
            admin_area_2: shipping_address.city,
            postal_code: shipping_address.pinCode,
            country_code: 'US'
          }
        }
      },
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: calculatedTotal.toFixed(2), // Use calculated total
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: itemTotal.toFixed(2)
            },
            shipping: {
              currency_code: 'USD',
              value: shippingCost.toFixed(2)
            },
            tax_total: {
              currency_code: 'USD',
              value: taxAmount.toFixed(2)
            }
          }
        },
        description: 'Order from Merk Store',
        items: productDetail.map(item => ({
          name: item.product?.name || item.name || 'Product',
          unit_amount: {
            currency_code: 'USD',
            value: Number(item.price).toFixed(2)
          },
          quantity: String(item.qty || item.quantity || 1)
        })),
        shipping: {
          name: {
            full_name: `${shipping_address.firstName} ${shipping_address.lastName}`.trim()
          },
          address: {
            address_line_1: shipping_address.address,
            admin_area_2: shipping_address.city,
            postal_code: shipping_address.pinCode,
            country_code: 'US'
          }
        }
      }]
    });

    console.log('🟢 [PayPal Backend] Executing card payment...');
    const order = await client().execute(request);

    console.log('🟢 [PayPal Backend] Card payment successful:', order.result.id);

    // Save order to database
    const newOrder = new ProductRequest({
      user: req.user.id,
      productDetail: productDetail,
      shipping_address: shipping_address,
      total: total,
      tax: taxAmount,
      deliveryCharge: shippingCost,
      paymentmode: 'card',
      status: 'Pending',
      orderId: `ORD-${Date.now()}`,
      paypalOrderId: order.result.id,
      paypalStatus: order.result.status
    });

    await newOrder.save();

    res.json({
      status: true,
      message: 'Payment processed successfully',
      orderId: newOrder._id,
      paypalOrderId: order.result.id,
      data: order.result
    });

  } catch (error) {
    console.error('❌ [PayPal Backend] Card Payment Error:', error);
    
    let errorMessage = 'Failed to process card payment';
    
    if (error.message.includes('INVALID_CARD_NUMBER')) {
      errorMessage = 'Invalid card number';
    } else if (error.message.includes('CARD_EXPIRED')) {
      errorMessage = 'Card has expired';
    } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
      errorMessage = 'Insufficient funds';
    } else if (error.message.includes('CARD_DECLINED')) {
      errorMessage = 'Card was declined';
    }

    res.status(500).json({
      status: false,
      message: errorMessage,
      error: error.message
    });
  }
};
