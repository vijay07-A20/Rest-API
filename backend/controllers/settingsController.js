import { memoryStore } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export function getSettings(req, res) {
  const settings = memoryStore.getSettings();
  return successResponse(res, settings, 'System settings retrieved');
}

export function updateSettings(req, res) {
  const {
    maxRequestsPerMinute,
    burstLimit,
    slidingWindowSeconds,
    quarantineDurationSeconds,
    dfaStrictness,
    ipWhitelist,
    ipBlacklist,
  } = req.body;

  const updates = {};
  if (maxRequestsPerMinute !== undefined) {
    const val = parseInt(maxRequestsPerMinute, 10);
    if (isNaN(val) || val < 1) return errorResponse(res, 'maxRequestsPerMinute must be at least 1', 400);
    updates.maxRequestsPerMinute = val;
  }

  if (burstLimit !== undefined) {
    const val = parseInt(burstLimit, 10);
    if (isNaN(val) || val < 1) return errorResponse(res, 'burstLimit must be at least 1', 400);
    updates.burstLimit = val;
  }

  if (slidingWindowSeconds !== undefined) {
    const val = parseInt(slidingWindowSeconds, 10);
    if (isNaN(val) || val < 5) return errorResponse(res, 'slidingWindowSeconds must be at least 5', 400);
    updates.slidingWindowSeconds = val;
  }

  if (quarantineDurationSeconds !== undefined) {
    const val = parseInt(quarantineDurationSeconds, 10);
    if (isNaN(val) || val < 5) return errorResponse(res, 'quarantineDurationSeconds must be at least 5', 400);
    updates.quarantineDurationSeconds = val;
  }

  if (dfaStrictness !== undefined) {
    if (!['PERMISSIVE', 'MODERATE', 'STRICT'].includes(dfaStrictness)) {
      return errorResponse(res, 'dfaStrictness must be PERMISSIVE, MODERATE, or STRICT', 400);
    }
    updates.dfaStrictness = dfaStrictness;
  }

  if (Array.isArray(ipWhitelist)) {
    updates.ipWhitelist = ipWhitelist;
  }

  if (Array.isArray(ipBlacklist)) {
    updates.ipBlacklist = ipBlacklist;
  }

  const saved = memoryStore.updateSettings(updates);
  return successResponse(res, saved, 'System settings updated successfully');
}
