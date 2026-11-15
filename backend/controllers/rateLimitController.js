import { rateLimiterEngine } from '../middleware/rateLimiter.js';
import { memoryStore } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export function getRateLimitStatus(req, res) {
  const activeClients = rateLimiterEngine.getActiveClients();
  const settings = memoryStore.getSettings();

  return successResponse(res, {
    configuredLimit: settings.maxRequestsPerMinute,
    windowSeconds: settings.slidingWindowSeconds,
    quarantineDurationSeconds: settings.quarantineDurationSeconds,
    activeClientCount: activeClients.length,
    clients: activeClients,
  }, 'Rate limiting engine status retrieved');
}

export function resetClientLimit(req, res) {
  const { clientKey } = req.body;
  if (!clientKey) {
    return errorResponse(res, 'clientKey is required to reset rate limit.', 400);
  }

  rateLimiterEngine.resetClient(clientKey);
  return successResponse(res, { clientKey }, `Rate limit for client ${clientKey} has been reset successfully`);
}
