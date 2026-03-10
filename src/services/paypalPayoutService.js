const paypal = require('@paypal/payouts-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing');
  }

  return mode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

async function createPayout(recipientEmail, amount, note, withdrawalId) {
  try {
    const requestBody = {
      sender_batch_header: {
        sender_batch_id: `Withdrawal_${withdrawalId}_${Date.now()}`,
        email_subject: 'You have a payout!',
        email_message: 'You have received a payout from Merk! Thanks for using our service!'
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency: 'USD'
          },
          note: note || 'Withdrawal from Merk wallet',
          sender_item_id: `item_${withdrawalId}`,
          receiver: recipientEmail
        }
      ]
    };

    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);

    const response = await client().execute(request);
    
    return {
      success: true,
      batchId: response.result.batch_header.payout_batch_id,
      batchStatus: response.result.batch_header.batch_status,
      data: response.result
    };
  } catch (error) {
    console.error('PayPal Payout Error:', error);
    return {
      success: false,
      error: error.message || 'Payout failed'
    };
  }
}

async function getPayoutStatus(payoutBatchId) {
  try {
    const request = new paypal.payouts.PayoutsGetRequest(payoutBatchId);
    const response = await client().execute(request);
    
    return {
      success: true,
      status: response.result.batch_header.batch_status,
      data: response.result
    };
  } catch (error) {
    console.error('PayPal Get Payout Status Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get payout status'
    };
  }
}

module.exports = {
  createPayout,
  getPayoutStatus
};
