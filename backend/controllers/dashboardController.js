import { getDashboardStats, getAnalyticsData } from '../services/analyticsService.js';
import { getNetworkArchitectureComparison } from '../services/networkContextService.js';
import { successResponse } from '../utils/responseFormatter.js';
import { isMongoConnected } from '../config/db.js';

export function getStats(req, res) {
  const stats = getDashboardStats();
  return successResponse(res, {
    ...stats,
    databaseStatus: isMongoConnected ? 'MongoDB Connected' : 'In-Memory Fallback Active',
  }, 'Dashboard metrics fetched successfully');
}

export function getNetworkInfo(req, res) {
  const info = getNetworkArchitectureComparison();
  return successResponse(res, info, 'Computer Networks academic comparison data retrieved');
}
