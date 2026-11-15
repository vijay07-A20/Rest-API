import { memoryStore } from '../config/db.js';
import { getAnalyticsData } from '../services/analyticsService.js';
import { successResponse } from '../utils/responseFormatter.js';

export function getRequests(req, res) {
  const { method, statusCode, classification, search, limit = 50, page = 1 } = req.query;

  let logs = memoryStore.getLogs({}, 500);

  if (method) {
    logs = logs.filter(l => l.method.toUpperCase() === method.toUpperCase());
  }

  if (statusCode) {
    logs = logs.filter(l => l.statusCode === parseInt(statusCode, 10));
  }

  if (classification) {
    logs = logs.filter(l => l.classification.toLowerCase() === classification.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    logs = logs.filter(l =>
      l.endpoint.toLowerCase().includes(s) ||
      l.clientIpMasked.toLowerCase().includes(s) ||
      (l.rejectionReason && l.rejectionReason.toLowerCase().includes(s))
    );
  }

  const parsedLimit = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const parsedPage = Math.max(1, parseInt(page, 10));
  const startIndex = (parsedPage - 1) * parsedLimit;
  const paginated = logs.slice(startIndex, startIndex + parsedLimit);

  return successResponse(res, {
    total: logs.length,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(logs.length / parsedLimit) || 1,
    requests: paginated,
  }, 'API Request logs retrieved successfully');
}

export function getAnalytics(req, res) {
  const analytics = getAnalyticsData();
  return successResponse(res, analytics, 'Traffic analytics datasets retrieved successfully');
}
