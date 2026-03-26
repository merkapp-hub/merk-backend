const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { client } = require('@config/paypal');
const Product = require('@models/Product');
const Card = require('@models/Card');
const oneSignalService = require('../services/oneSignalService');

// Create PayPal Order
exports.createOrder = async (req, res) => {
  try {
    const { items, shipping_address } = req.body;
    let total = Number(req.body.total);

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Cart items are required'
      });
    }

  
    const itemTotal = items.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.qty));
    }, 0);

    // Validate shipping address required fields
    if (shipping_address) {
      // if (!shipping_address.pinCode || shipping_address.pinCode.trim() === '') {
      //   return res.status(400).json({
      //     status: false,
      //     message: 'Pin Code is required for payment processing'
      //   });
      // }
      if (!shipping_address.address || shipping_address.address.trim() === '') {
        return res.status(400).json({
          status: false,
          message: 'Address is required for payment processing'
        });
      }
      if (!shipping_address.city || shipping_address.city.trim() === '') {
        return res.status(400).json({
          status: false,
          message: 'City is required for payment processing'
        });
      }
    }


    let shippingCost = Number(total) - itemTotal;


    if (shippingCost < 0) {
      shippingCost = 0;
      total = itemTotal;
    }


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
          country_code: shipping_address.country?.value || 'HN' 
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
        return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'https://www.merkapp.net'}/billingdetails`,
        cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'https://www.merkapp.net'}/cart`
      }
    });

    const order = await client().execute(request);
    const approvalUrl = order.result.links?.find(link => link.rel === 'approve')?.href;

    res.json({
      status: true,
      orderId: order.result.id,
      data: order.result,
      approvalUrl: approvalUrl
    });

  } catch (error) {
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

    // Check actual payment capture status
    const captureStatus = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    const isActuallyPaid = captureStatus === 'COMPLETED';

    if (capture.result.status === 'COMPLETED' && isActuallyPaid) {
      res.json({
        status: true,
        message: 'Payment completed successfully',
        data: capture.result,
        captureId: capture.result.purchase_units[0].payments.captures[0].id,
        actuallyPaid: true
      });
    } else {
      res.status(400).json({
        status: false,
        message: 'Payment not completed or card was declined',
        orderStatus: capture.result.status,
        captureStatus: captureStatus || 'NOT_CAPTURED',
        actuallyPaid: false,
        data: capture.result
      });
    }

  } catch (error) {
    const isCardDeclined = error.message?.includes('PAYER_CANNOT_PAY') ||
      error.message?.includes('CARD_DECLINED') ||
      error.message?.includes('INSTRUMENT_DECLINED');

    res.status(error.statusCode || 500).json({
      status: false,
      message: isCardDeclined ? 'Card was declined. Please use a valid payment method.' : 'Failed to capture PayPal payment',
      error: error.message,
      details: error.details,
      actuallyPaid: false
    });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderID } = req.params;

    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);
    const order = await client().execute(request);

    // Check if payment was actually captured
    const captureStatus = order.result.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    const isActuallyPaid = captureStatus === 'COMPLETED';

    res.json({
      status: true,
      data: order.result,
      actuallyPaid: isActuallyPaid,
      captureStatus: captureStatus || 'NOT_CAPTURED'
    });

  } catch (error) {
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
    const { card: cardFromBody, card_id, shipping_address, productDetail, total, subtotal, shipping, tax, deliveryCharge: deliveryChargeFromBody, userCurrency, currencySymbol, exchangeRate } = req.body;
    const ProductRequest = require('@models/ProductRequest');

    // Support both direct card object and saved card_id
    let card = cardFromBody;
    if (card_id && !card) {
      const savedCard = await Card.findById(card_id);
      if (!savedCard) {
        return res.status(400).json({ status: false, message: 'Saved card not found' });
      }
      card = {
        number: savedCard.cardNumber,
        expiry: `${savedCard.expiryMonth}/${savedCard.expiryYear}`,
        cvv: savedCard.cvv,
        name: savedCard.cardholderName
      };
    }

    if (!productDetail || productDetail.length === 0) {
      return res.status(400).json({ status: false, message: 'Product details are required' });
    }

    if (!card || !card.number || !card.expiry || !card.cvv || !card.name) {
      return res.status(400).json({ status: false, message: 'Complete card details are required (number, expiry, cvv, name)' });
    }

    if (!shipping_address || !shipping_address.firstName || !shipping_address.address) {
      return res.status(400).json({ status: false, message: 'Complete shipping address is required' });
    }

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ status: false, message: 'Invalid total amount' });
    }

    const cardNumber = card.number.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return res.status(400).json({ status: false, message: 'Invalid card number' });
    }

    const [expMonth, expYear] = card.expiry.split('/');
    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
      return res.status(400).json({ status: false, message: 'Invalid expiry date format. Use MM/YY' });
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const cardYear = parseInt(expYear);
    const cardMonth = parseInt(expMonth);

    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      return res.status(400).json({ status: false, message: 'Card has expired' });
    }

    if (cardMonth < 1 || cardMonth > 12) {
      return res.status(400).json({ status: false, message: 'Invalid expiry month' });
    }

    const requestId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.headers['PayPal-Request-Id'] = requestId;

    const itemTotal = productDetail.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.qty || item.quantity || 1));
    }, 0);

    const shippingCost = Number(deliveryChargeFromBody) || Number(shipping) || 0;
    const taxAmount = Number(tax) || 0;

    console.log('🚚 Backend delivery charge debug:', {
      deliveryChargeFromBody,
      shipping,
      shippingCost,
    });
    const calculatedTotal = itemTotal + shippingCost + taxAmount;

    const finalItemTotal = parseFloat(itemTotal.toFixed(2));
    const finalShipping = parseFloat(shippingCost.toFixed(2));
    const finalTax = parseFloat(taxAmount.toFixed(2));
    const finalTotal = parseFloat(calculatedTotal.toFixed(2));

    console.log('PayPal Order Calculation:', { itemTotal: finalItemTotal, shipping: finalShipping, tax: finalTax, calculatedTotal: finalTotal, receivedTotal: Number(total) });

    let countryCode = 'HN';
    if (shipping_address.country) {
      const countryMap = { 'Honduras': 'HN', 'Guatemala': 'GT', 'El Salvador': 'SV', 'United States': 'US', 'USA': 'US' };
      countryCode = countryMap[shipping_address.country] || 'HN';
    }

    request.requestBody({
      intent: 'CAPTURE',
      payment_source: {
        card: {
          number: cardNumber,
          expiry: `20${expYear}-${expMonth.padStart(2, '0')}`,
          security_code: card.cvv,
          name: card.name || 'Card Holder',
          billing_address: {
            address_line_1: shipping_address.address || '123 Main St',
            admin_area_2: shipping_address.city || 'New York',
            admin_area_1: shipping_address.state || 'NY',
            postal_code: shipping_address.pinCode || '10001',
            country_code: countryCode
          }
        }
      },
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: finalTotal.toFixed(2),
          breakdown: {
            item_total: { currency_code: 'USD', value: finalItemTotal.toFixed(2) },
            shipping: { currency_code: 'USD', value: finalShipping.toFixed(2) },
            tax_total: { currency_code: 'USD', value: finalTax.toFixed(2) }
          }
        },
        description: 'Order from Merk Store',
        items: productDetail.map(item => ({
          name: (item.product?.name || item.name || 'Product').substring(0, 127),
          unit_amount: { currency_code: 'USD', value: parseFloat(Number(item.price).toFixed(2)).toFixed(2) },
          quantity: String(item.qty || item.quantity || 1)
        })),
        shipping: {
          name: { full_name: `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim() || 'Customer' },
          address: {
            address_line_1: shipping_address.address || '123 Main St',
            admin_area_2: shipping_address.city || 'New York',
            admin_area_1: shipping_address.state || 'NY',
            postal_code: shipping_address.pinCode || '10001',
            country_code: countryCode
          }
        }
      }]
    });

    console.log('PayPal Card Payment Request Data:', { cardNumber: cardNumber.substring(0, 4) + '****', expiry: `20${expYear}-${expMonth.padStart(2, '0')}`, cvv: '***', name: card.name, countryCode, finalTotal, finalItemTotal, finalShipping, finalTax });

    const order = await client().execute(request);

    console.log('PayPal order result:', {
      mode: process.env.PAYPAL_MODE,
      orderId: order.result.id,
      status: order.result.status,
      environment: order.result.links?.[0]?.href?.includes('sandbox') ? 'SANDBOX' : 'LIVE',
    });

    if (order.result.status !== 'COMPLETED') {
      const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(order.result.id);
      captureRequest.requestBody({});
      const capture = await client().execute(captureRequest);
      console.log('Capture Response:', capture.result);
      if (capture.result.status !== 'COMPLETED') {
        return res.status(400).json({ status: false, message: 'Payment not completed', data: capture.result });
      }
    }

    // Group items by seller and create one order per seller
    const User = require('@models/User');
    const mongoose = require('mongoose');

    // Resolve seller_id for each item — fetch from Product if placeholder/invalid
    const productIds = productDetail.map(i => i.product).filter(Boolean);
    const productDocs = await require('@models/Product').find({ _id: { $in: productIds } }).select('userid').lean();
    const productSellerMap = {};
    productDocs.forEach(p => { productSellerMap[p._id.toString()] = p.userid?.toString(); });

    const sellerGroups = {};
    for (const item of productDetail) {
      let sid = item.seller_id ? item.seller_id.toString() : null;
      // If seller_id is missing or not a valid ObjectId, look it up from the product
      if (!sid || !mongoose.Types.ObjectId.isValid(sid)) {
        sid = item.product ? productSellerMap[item.product.toString()] || null : null;
      }
      const key = sid || '__none__';
      if (!sellerGroups[key]) {
        sellerGroups[key] = { seller_id: sid, items: [], itemTotal: 0 };
      }
      sellerGroups[key].items.push(item);
      sellerGroups[key].itemTotal += Number(item.price) * Number(item.qty || item.quantity || 1);
    }

    const groupKeys = Object.keys(sellerGroups);
    const multiSeller = groupKeys.length > 1;
    const savedOrders = [];

    for (const key of groupKeys) {
      const group = sellerGroups[key];
      const groupItemTotal = parseFloat(group.itemTotal.toFixed(2));
      const groupShipping = multiSeller
        ? parseFloat(((groupItemTotal / finalItemTotal) * finalShipping).toFixed(2))
        : finalShipping;
      const groupTax = multiSeller
        ? parseFloat(((groupItemTotal / finalItemTotal) * finalTax).toFixed(2))
        : finalTax;
      const groupFinalAmount = parseFloat((groupItemTotal + groupShipping + groupTax).toFixed(2));

      const orderData = {
        user: req.user.id,
        productDetail: group.items,
        shipping_address: shipping_address,
        total: groupItemTotal,
        tax: groupTax,
        deliveryCharge: groupShipping,
        finalAmount: groupFinalAmount,
        paymentmode: 'card',
        status: 'Pending',
        paypalOrderId: order.result.id,
        paypalStatus: order.result.status,
        userCurrency: userCurrency || 'USD',
        currencySymbol: currencySymbol || '$',
        exchangeRate: exchangeRate || 1,
      };
      if (group.seller_id) orderData.seller_id = group.seller_id;

      const newOrder = new ProductRequest(orderData);
      const savedOrder = await newOrder.save();
      savedOrders.push(savedOrder);

      // Notify seller
      if (group.seller_id) {
        try {
          const seller = await User.findById(group.seller_id);
          if (seller) await oneSignalService.newOrderForSeller(savedOrder, seller);
        } catch (e) { console.error('Seller notification error:', e); }
      }
    }

    // Notify buyer once
    try {
      const user = await User.findById(req.user.id);
      if (user) await oneSignalService.orderReceived(savedOrders[0], user);
    } catch (notificationError) {
      console.error('OneSignal notification error:', notificationError);
    }

    res.json({
      status: true,
      message: 'Payment processed successfully',
      orderId: savedOrders[0]._id,
      orderIds: savedOrders.map(o => o._id),
      paypalOrderId: order.result.id,
      data: order.result
    });

  } catch (error) {
    console.error('PayPal Card Payment Error:', error);

    let errorMessage = 'Failed to process card payment';
    let statusCode = 500;

    // Check error.details array for CVV failure (PayPal sends it here)
    const detailsStr = JSON.stringify(error.details || []);

    if (error.statusCode) {
      statusCode = error.statusCode;

      if (error.message.includes('INVALID_CARD_NUMBER')) {
        errorMessage = 'Invalid card number';
        statusCode = 400;
      } else if (error.message.includes('CARD_EXPIRED')) {
        errorMessage = 'Card has expired';
        statusCode = 400;
      } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
        errorMessage = 'Insufficient funds';
        statusCode = 400;
      } else if (error.message.includes('CARD_DECLINED')) {
        errorMessage = 'Card was declined';
        statusCode = 400;
      } else if (
        error.message.includes('CVV_FAILURE') ||
        error.message.includes('CVV2_FAILURE') ||
        detailsStr.includes('CVV')
      ) {
        errorMessage = 'Card CVV is incorrect. Please check your card details.';
        statusCode = 400;
      } else if (error.message.includes('UNPROCESSABLE_ENTITY')) {
        errorMessage = 'Invalid payment information. Please check your card details and address.';
        statusCode = 400;
      } else if (error.message.includes('INVALID_REQUEST')) {
        errorMessage = 'Invalid payment request. Please try again.';
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      status: false,
      message: errorMessage,
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


exports.processCardPaymentNew = async (req, res) => {
  try {
    const { card_id, shipping_address, productDetail, total, subtotal, shipping, tax, deliveryCharge, userCurrency, currencySymbol, exchangeRate } = req.body;
    const ProductRequest = require('@models/ProductRequest');

    console.log(total)

    // Validate required fields
    if (!productDetail || productDetail.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Product details are required'
      });
    }

    const cards = await Card.findById(card_id);

    let card = {}
    if (cards) {
      card = {
        number: cards.cardNumber,
        expiry: cards.expiryMonth + "/" + cards.expiryYear,
        cvv: cards.cvv,
        name: cards.cardholderName
      }
    }

    console.log(card)



    if (!card || !card.number || !card.expiry || !card.cvv || !card.name) {
      return res.status(400).json({
        status: false,
        message: 'Complete card details are required (number, expiry, cvv, name)'
      });
    }

    if (!shipping_address || !shipping_address.firstName || !shipping_address.address) {
      return res.status(400).json({
        status: false,
        message: 'Complete shipping address is required'
      });
    }

    if (!total || isNaN(total) || total <= 0) {
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
    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
      return res.status(400).json({
        status: false,
        message: 'Invalid expiry date format. Use MM/YY'
      });
    }

    // Validate expiry date
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const cardYear = parseInt(expYear);
    const cardMonth = parseInt(expMonth);

    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      return res.status(400).json({
        status: false,
        message: 'Card has expired'
      });
    }

    if (cardMonth < 1 || cardMonth > 12) {
      return res.status(400).json({
        status: false,
        message: 'Invalid expiry month'
      });
    }

    // Generate unique PayPal-Request-Id
    const requestId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create PayPal order with card payment source
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    // Add PayPal-Request-Id header
    request.headers['PayPal-Request-Id'] = requestId;

    // Calculate item total
    const itemTotal = productDetail.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.qty || item.quantity || 1));
    }, 0);

    const shippingCost = Number(deliveryCharge) || Number(shipping) || 0;
    const taxAmount = Number(tax) || 0;

    // Always calculate total from parts to ensure PayPal breakdown matches
    const calculatedTotal = itemTotal + shippingCost + taxAmount;

    // Fix floating point precision issues
    const finalItemTotal = parseFloat(itemTotal.toFixed(2));
    const finalShipping = parseFloat(shippingCost.toFixed(2));
    const finalTax = parseFloat(taxAmount.toFixed(2));
    const finalTotal = parseFloat(calculatedTotal.toFixed(2));
    const mainTotal = finalTotal; // Use calculated total, not the one from request

    console.log(mainTotal, finalTotal)

    console.log('PayPal Order Calculation:', {
      itemTotal: finalItemTotal,
      shipping: finalShipping,
      tax: finalTax,
      calculatedTotal: finalTotal,
      receivedTotal: Number(total)
    });

    // Determine country code based on shipping address
    let countryCode = 'HN'; // Default to Honduras for this client
    if (shipping_address.country) {
      const countryMap = {
        'Honduras': 'HN',
        'Guatemala': 'GT',
        'El Salvador': 'SV',
        'United States': 'US',
        'USA': 'US'
      };
      countryCode = countryMap[shipping_address.country] || 'HN'; // Default to Honduras
    }

    const purchase_units = [{
      amount: {
        currency_code: 'USD',
        value: mainTotal.toFixed(2), // Use string format with 2 decimals
        breakdown: {
          item_total: {
            currency_code: 'USD',
            value: finalItemTotal.toFixed(2)
          },
          shipping: {
            currency_code: 'USD',
            value: finalShipping.toFixed(2)
          },

          tax_total: {
            currency_code: 'USD',
            value: finalTax.toFixed(2)
          }
        }
      },
      description: 'Order from Merk Store',
      items: productDetail.map(item => ({
        name: (item.product?.name || item.name || 'Product').substring(0, 127), // PayPal limit
        unit_amount: {
          currency_code: 'USD',
          value: parseFloat(Number(item.price).toFixed(2)).toFixed(2) // Ensure proper format
        },
        quantity: String(item.qty || item.quantity || 1)
      })),
      shipping: {
        name: {
          full_name: `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim() || 'Customer'
        },
        address: {
          address_line_1: shipping_address.address || '123 Main St',
          admin_area_2: shipping_address.city || 'New York',
          admin_area_1: shipping_address.state || 'NY',
          postal_code: shipping_address.pinCode || '10001',
          country_code: countryCode
        }
      }
    }]

    console.log(purchase_units[0].amount)

    // return res.status(400).json({
    //   status: false,
    //   message: 'Complete card details are required (number, expiry, cvv, name)'
    // });


    request.requestBody({
      intent: 'CAPTURE',
      payment_source: {
        card: {
          number: cardNumber,
          expiry: `20${expYear}-${expMonth.padStart(2, '0')}`,
          security_code: card.cvv,
          name: card.name || 'Card Holder',
          billing_address: {
            address_line_1: shipping_address.address || '123 Main St',
            admin_area_2: shipping_address.city || 'New York',
            admin_area_1: shipping_address.state || 'NY',
            postal_code: shipping_address.pinCode || '10001',
            country_code: countryCode
          },
          attributes: {
  verification: {
    method: "SCA_ALWAYS"
  }
}
        }
      },
      purchase_units
    });

    console.log('PayPal Card Payment Request Data:', {
      cardNumber: cardNumber.substring(0, 4) + '****',
      expiry: `20${expYear}-${expMonth.padStart(2, '0')}`,
      cvv: '***',
      name: card.name,
      countryCode,
      finalTotal,
      finalItemTotal,
      finalShipping,
      finalTax
    });

    const order = await client().execute(request);
    console.log(order)
    if (order.result.status !== 'COMPLETED') {
      const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(order.result.id);
      captureRequest.requestBody({});

      const capture = await client().execute(captureRequest);

      console.log('Capture Response:', capture.result);

      if (capture.result.status !== 'COMPLETED') {
        return res.status(400).json({
          status: false,
          message: 'Payment not completed',
          data: capture.result
        });
      }
    }

    // Save order to database
    // Group items by seller and create one order per seller
    const User = require('@models/User');
    const mongoose = require('mongoose');

    // Resolve seller_id for each item — fetch from Product if placeholder/invalid
    const productIds = productDetail.map(i => i.product).filter(Boolean);
    const productDocs = await require('@models/Product').find({ _id: { $in: productIds } }).select('userid').lean();
    const productSellerMap = {};
    productDocs.forEach(p => { productSellerMap[p._id.toString()] = p.userid?.toString(); });

    const sellerGroups = {};
    for (const item of productDetail) {
      let sid = item.seller_id ? item.seller_id.toString() : null;
      // If seller_id is missing or not a valid ObjectId, look it up from the product
      if (!sid || !mongoose.Types.ObjectId.isValid(sid)) {
        sid = item.product ? productSellerMap[item.product.toString()] || null : null;
      }
      const key = sid || '__none__';
      if (!sellerGroups[key]) {
        sellerGroups[key] = { seller_id: sid, items: [], itemTotal: 0 };
      }
      sellerGroups[key].items.push(item);
      sellerGroups[key].itemTotal += Number(item.price) * Number(item.qty || item.quantity || 1);
    }

    const groupKeys = Object.keys(sellerGroups);
    const multiSeller = groupKeys.length > 1;
    const savedOrders = [];

    for (const key of groupKeys) {
      const group = sellerGroups[key];
      const groupItemTotal = parseFloat(group.itemTotal.toFixed(2));
      const groupShipping = multiSeller
        ? parseFloat(((groupItemTotal / finalItemTotal) * finalShipping).toFixed(2))
        : finalShipping;
      const groupTax = multiSeller
        ? parseFloat(((groupItemTotal / finalItemTotal) * finalTax).toFixed(2))
        : finalTax;
      const groupFinalAmount = parseFloat((groupItemTotal + groupShipping + groupTax).toFixed(2));

      const orderData = {
        user: req.user.id,
        productDetail: group.items,
        shipping_address: shipping_address,
        total: groupItemTotal,
        tax: groupTax,
        deliveryCharge: groupShipping,
        finalAmount: groupFinalAmount,
        paymentmode: 'card',
        status: 'Pending',
        paypalOrderId: order.result.id,
        paypalStatus: order.result.status,
        userCurrency: userCurrency || 'USD',
        currencySymbol: currencySymbol || '$',
        exchangeRate: exchangeRate || 1,
      };
      if (group.seller_id) orderData.seller_id = group.seller_id;

      const newOrder = new ProductRequest(orderData);
      const savedOrder = await newOrder.save();
      savedOrders.push(savedOrder);

      // Notify seller
      if (group.seller_id) {
        try {
          const seller = await User.findById(group.seller_id);
          if (seller) await oneSignalService.newOrderForSeller(savedOrder, seller);
        } catch (e) { console.error('Seller notification error:', e); }
      }
    }

    // Notify buyer once
    try {
      const user = await User.findById(req.user.id);
      if (user) await oneSignalService.orderReceived(savedOrders[0], user);
    } catch (notificationError) {
      console.error('OneSignal notification error:', notificationError);
    }

    res.json({
      status: true,
      message: 'Payment processed successfully',
      orderId: savedOrders[0]._id,
      orderIds: savedOrders.map(o => o._id),
      paypalOrderId: order.result.id,
      data: order.result
    });

  } catch (error) {
    console.error('PayPal Card Payment Error:', error);

    let errorMessage = 'Failed to process card payment';
    let statusCode = 500;

    // Handle PayPal specific errors
    if (error.statusCode) {
      statusCode = error.statusCode;

      if (error.message.includes('INVALID_CARD_NUMBER')) {
        errorMessage = 'Invalid card number';
        statusCode = 400;
      } else if (error.message.includes('CARD_EXPIRED')) {
        errorMessage = 'Card has expired';
        statusCode = 400;
      } else if (error.message.includes('INSUFFICIENT_FUNDS')) {
        errorMessage = 'Insufficient funds';
        statusCode = 400;
      } else if (error.message.includes('CARD_DECLINED')) {
        errorMessage = 'Card was declined';
        statusCode = 400;
      } else if (error.message.includes('UNPROCESSABLE_ENTITY')) {
        errorMessage = 'Invalid payment information. Please check your card details and address.';
        statusCode = 400;
      } else if (error.message.includes('INVALID_REQUEST')) {
        errorMessage = 'Invalid payment request. Please try again.';
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      status: false,
      message: errorMessage,
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
