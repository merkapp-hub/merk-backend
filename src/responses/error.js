'use strict';

const ErrorLog = require('@models/ErrorLog');

const saveErrorLog = (req, error, { statusCode = 500, source = 'app', meta = null } = {}) => {
  try {
    const errorName = error?.name || 'Error';
    const message = typeof error === 'string' ? error : error?.message || 'Unknown error';
    const stack = error?.stack || null;

    ErrorLog.create({
      method: req?.method || null,
      endpoint: req?.originalUrl || null,
      statusCode,
      errorName,
      message,
      stack,
      userId: req?.user?._id || req?.user?.id || null,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent: req?.headers?.['user-agent'] || null,
      source,
      meta,
    }).catch((err) => console.error('ErrorLog save failed:', err.message));
  } catch (e) {
    console.error('ErrorLog unexpected failure:', e.message);
  }
};

const errorResponse = (res, error) => {
  const req = res.req;
  saveErrorLog(req, error, { source: 'app' });

  const message = typeof error === 'string' ? error : error?.message;

  return res.status(500).send({
    status: false,
    name: error?.name,
    message,
    stack: error?.stack,
  });
};

module.exports = errorResponse;
module.exports.saveErrorLog = saveErrorLog;
