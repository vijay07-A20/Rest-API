/**
 * Standard REST API Response Formatter
 * Formats every API response with consistent envelopes, metadata, and timestamps.
 */

export function successResponse(res, data = null, message = 'Success', statusCode = 200, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      serverUptimeSec: Math.floor(process.uptime()),
      ...meta,
    },
  });
}

export function errorResponse(res, message = 'An error occurred', statusCode = 500, errorDetails = null, meta = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode,
      ...meta,
    },
  });
}
