import { memoryStore } from '../config/db.js';
import { successResponse } from '../utils/responseFormatter.js';

export function getAlerts(req, res) {
  const { limit = 50 } = req.query;
  const alerts = memoryStore.getAlerts(parseInt(limit, 10));
  return successResponse(res, {
    total: alerts.length,
    alerts,
  }, 'Security alerts fetched successfully');
}
