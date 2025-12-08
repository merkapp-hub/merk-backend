const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing in environment variables');
  }

  // Use sandbox for testing, live for production
  if (mode === 'live') {
    console.log('🔴 PayPal: Using LIVE environment');
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    console.log('🟡 PayPal: Using SANDBOX environment');
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
