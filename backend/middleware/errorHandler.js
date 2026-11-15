/**
 * Centralized Error Handling Middleware
 */

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    classification: 'Warning',
    meta: {
      timestamp: new Date().toISOString(),
      statusCode,
    },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.originalUrl}' not found on this server.`,
    error: 'HTTP 404 Not Found',
    classification: 'Warning',
    meta: {
      timestamp: new Date().toISOString(),
      requestedPath: req.originalUrl,
    },
  });
}
