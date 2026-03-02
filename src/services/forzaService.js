const https = require('https');
const crypto = require('crypto');


const FORZA_CONFIG = {
  GUATEMALA: {
    baseURL: process.env.FORZA_BASE_URL || 'https://sandbox.apicore.forzadelivery.io:40467',
    codApp: process.env.FORZA_GT_CODAPP || 'SIPRUEBAPIECOM080320241034',
    secretKey: process.env.FORZA_GT_SECRET || 'es7D2rr88iTCQ6WSNWa5y6Xy8iHRPo41',
    codeOfReference: process.env.FORZA_GT_REF || '226952',
    idCliente: process.env.FORZA_GT_CLIENT || '21834',
    country: 'GT'
  },
  HONDURAS: {
    baseURL: process.env.FORZA_BASE_URL || 'https://sandbox.apicore.forzadelivery.io:40467',
    codApp: process.env.FORZA_HN_CODAPP || 'SIPRUEBASHONDURASAPIECO150520251939',
    secretKey: process.env.FORZA_HN_SECRET || 'SHyKQDB3K6dfHxR3Dbqw45CQMDEVLOP',
    codeOfReference: process.env.FORZA_HN_REF || '984339',
    idCliente: process.env.FORZA_HN_CLIENT || '78653',
    country: 'HN'
  },
  EL_SALVADOR: {
    baseURL: process.env.FORZA_BASE_URL || 'https://sandbox.apicore.forzadelivery.io:40467',
    codApp: process.env.FORZA_SV_CODAPP || '',
    secretKey: process.env.FORZA_SV_SECRET || '',
    codeOfReference: process.env.FORZA_SV_REF || '',
    idCliente: process.env.FORZA_SV_CLIENT || '',
    country: 'SV'
  }
};

const ENDPOINTS = {
  GET_MUNICIPALITIES: '/ecommerce/GetListTownshipByHeaderCode',
  GET_SHIPPING_RATES: '/ecommerce/GetShippingRatesByHeaderCode',
  TRACK_ORDER: '/Ecommerce/GetTrackOrderDetail',
  CANCEL_GUIDES: '/Ecommerce/SetCancelGuides',
  REPRINT_GUIDE: '/ecommerce/GetGuideReprintRequest',
};

const getCountryConfig = (country) => {
  const countryMap = {
    'Guatemala': 'GUATEMALA',
    'GT': 'GUATEMALA',
    'Honduras': 'HONDURAS',
    'HN': 'HONDURAS',
    'El Salvador': 'EL_SALVADOR',
    'SV': 'EL_SALVADOR'
  };
  return FORZA_CONFIG[countryMap[country]] || FORZA_CONFIG.GUATEMALA;
};


function generateLauValue(jsonPayload, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(jsonPayload);
  return hmac.digest('base64');
}


function encodePayload(jsonObject) {
  const jsonString = JSON.stringify(jsonObject);
  return Buffer.from(jsonString).toString('base64');
}


function decodePayload(base64String) {
  const jsonString = Buffer.from(base64String, 'base64').toString('utf8');
  return JSON.parse(jsonString);
}



const makeRequest = (url, options, data = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {},
      rejectUnauthorized: false // For sandbox SSL
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: response, status: res.statusCode });
          } else {
            reject({ response: { data: response }, status: res.statusCode });
          }
        } catch (e) {
          reject({ message: 'Invalid JSON response', body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};


async function callForzaAPI(config, endpoint, payloadJson) {
  try {
    const rawJson = JSON.stringify(payloadJson);
    const lauValue = generateLauValue(rawJson, config.secretKey);
    const encodedPayload = encodePayload(payloadJson);

    const requestBody = {
      CodApp: config.codApp,
      PayLoad: encodedPayload
    };

    const response = await makeRequest(
      `${config.baseURL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'LauValue': lauValue
        }
      },
      requestBody
    );

    
    if (response.data && response.data.PayLoad) {
      const decodedResponse = decodePayload(response.data.PayLoad);
      return { success: true, data: decodedResponse };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Forza API Error:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}


const getShippingRates = async (orderData) => {
  try {
    const country = orderData.shipping_address?.country?.label || 'Guatemala';
    const config = getCountryConfig(country);

   
    const totalWeight = orderData.totalWeight || orderData.productDetail.length * 0.5;
    const totalValue = orderData.total || 0;

    const parcels = orderData.productDetail.map(item => ({
      length: 20, 
      width: 20,
      height: 15,
      weight: (item.qty || 1) * 0.5, 
      amount: String(item.price * item.qty),
      currency: 'USD',
      fragil: 'false',
      description: item.name || 'Product',
      ParcelCode: ''
    }));

    const payload = {
      Method: 'GetShippingRatesByHeaderCode',
      Params: {
        HeaderCodeSource: config.codeOfReference,
        HeaderCodeDestiny: config.codeOfReference, 
        DateOfSale: new Date().toISOString().slice(0, 16).replace('T', ' '),
        IdCountry: config.country,
        parcels: parcels,
        TotalWeight: String(totalWeight),
        TotalValue: String(totalValue),
        Currency: 'USD',
        CountPieces: orderData.productDetail.length,
        ObjectType: 'Products',
        CreditCode: '0',
        IdMerchant: config.idCliente,
        IsInsuarence: false,
        InsuarenceAmount: '0'
      }
    };

    const result = await callForzaAPI(config, ENDPOINTS.GET_SHIPPING_RATES, payload);

    if (result.success && result.data.StatusCode === 200) {
   
      return {
        success: true,
        rates: result.data.ShippingRates || [],
        message: 'Shipping rates retrieved successfully'
      };
    }

    return {
      success: false,
      error: result.data?.Message || 'Failed to get shipping rates'
    };
  } catch (error) {
    console.error('Get shipping rates error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


const createShipment = async (orderData) => {
  try {
    console.log('Forza: Getting shipping rates for order:', orderData.orderId);
    
   
    const ratesResult = await getShippingRates(orderData);

    if (ratesResult.success) {
    
      return {
        success: true,
        trackingNumber: `MERK-${orderData.orderId}`, 
        shipmentId: orderData.orderId,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        rates: ratesResult.rates,
        message: 'Shipment rates calculated. Note: Actual shipment creation endpoint not available in API docs.'
      };
    }

    return ratesResult;
  } catch (error) {
    console.error('Forza shipment creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


const trackShipment = async (trackingNumber, country = 'Guatemala') => {
  try {
    const config = getCountryConfig(country);

    const guideNumber = trackingNumber.replace(/^FD/, '');

    const payload = {
      Method: 'GetTrackOrderDetail',
      Params: {
        GuideSerie: 'FD',
        GuideNumber: parseInt(guideNumber)
      }
    };

    const result = await callForzaAPI(config, ENDPOINTS.TRACK_ORDER, payload);

    if (result.success && result.data.StatusCode === 200) {
      const trackData = result.data.TrackOrder || {};
      return {
        success: true,
        status: trackData.Status || 'Unknown',
        history: trackData.History || [],
        currentLocation: trackData.CurrentLocation || '',
        estimatedDelivery: trackData.EstimatedDelivery || ''
      };
    }

    return {
      success: false,
      error: result.data?.Message || 'Tracking not found'
    };
  } catch (error) {
    console.error('Track shipment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


const cancelShipment = async (trackingNumber, country = 'Guatemala') => {
  try {
    const config = getCountryConfig(country);
    const guideNumber = trackingNumber.replace(/^FD/, '');

    const payload = {
      Method: 'SetCancelGuides',
      Params: {
        IdClient: config.idCliente,
        Token: config.codApp,
        Guides: [
          {
            Serie: 'FD',
            Number: parseInt(guideNumber)
          }
        ]
      }
    };

    const result = await callForzaAPI(config, ENDPOINTS.CANCEL_GUIDES, payload);

    if (result.success && result.data.StatusCode === 200) {
      return {
        success: true,
        message: 'Shipment cancelled successfully'
      };
    }

    return {
      success: false,
      error: result.data?.Message || 'Failed to cancel shipment'
    };
  } catch (error) {
    console.error('Cancel shipment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createShipment,
  trackShipment,
  cancelShipment,
  getShippingRates
};
