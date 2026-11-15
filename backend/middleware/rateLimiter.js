/**
 * Rate Limiting Engine: Sliding Window Counter Algorithm
 * Features:
 * - Configurable request quota (default 100 requests / 60 seconds per client IP/API key)
 * - Returns HTTP 429 Too Many Requests upon breach
 * - Emits RFC 6585 and IETF RateLimit headers:
 *   - Retry-After (seconds to wait)
 *   - X-RateLimit-Limit (total permitted quota)
 *   - X-RateLimit-Remaining (remaining tokens in sliding window)
 *   - X-RateLimit-Reset (Unix timestamp when oldest token expires)
 * - Transitions DFA state to S2 (Threshold Exceeded) and S3 (Rate Limited)
 */

import { extractClientIp, maskIpAddress } from '../utils/ipUtils.js';
import { memoryStore, isMongoConnected } from '../config/db.js';
import { RateLimitRecord } from '../models/RateLimitRecord.js';
import { dfaManager, DFA_INPUTS } from './dfaEngine.js';

class SlidingWindowRateLimiter {
  constructor() {
    this.inMemoryWindows = new Map(); // clientKey -> { timestamps: [], blockedUntil: null }
  }

  cleanOldTimestamps(timestamps, windowMs, now) {
    const cutoff = now - windowMs;
    // Fast filter keeping only timestamps inside active window
    return timestamps.filter(ts => ts > cutoff);
  }

  async checkLimit(req, res, next) {
    const settings = memoryStore.getSettings();
    const maxRequests = settings.maxRequestsPerMinute || 100;
    const windowSeconds = settings.slidingWindowSeconds || 60;
    const windowMs = windowSeconds * 1000;
    const now = Date.now();

    const clientIp = extractClientIp(req);
    const clientMasked = maskIpAddress(clientIp);
    const clientKey = clientIp;

    // 1. Check IP Blacklist
    if (settings.ipBlacklist && settings.ipBlacklist.includes(clientIp)) {
      dfaManager.transition(clientKey, DFA_INPUTS.REJECT_ENFORCED, 'IP on Blacklist');
      res.setHeader('Retry-After', 3600);
      return res.status(403).json({
        success: false,
        message: 'Forbidden: IP address is administratively blacklisted.',
        classification: 'Rate Limited',
        meta: { clientIpMasked: clientMasked, timestamp: new Date().toISOString() },
      });
    }

    // 2. Check IP Whitelist
    if (settings.ipWhitelist && settings.ipWhitelist.includes(clientIp)) {
      res.setHeader('X-RateLimit-Limit', 'UNLIMITED');
      res.setHeader('X-RateLimit-Remaining', 'UNLIMITED');
      req.rateLimitInfo = { isWhitelisted: true, remaining: 9999, limit: maxRequests };
      return next();
    }

    // Retrieve or initialize in-memory sliding window
    let clientWindow = this.inMemoryWindows.get(clientKey);
    if (!clientWindow) {
      clientWindow = { timestamps: [], blockedUntil: null, totalBlocked: 0 };
      this.inMemoryWindows.set(clientKey, clientWindow);
    }

    // Check if client is still in active temporary block quarantine
    if (clientWindow.blockedUntil && clientWindow.blockedUntil > now) {
      const retryAfterSec = Math.ceil((clientWindow.blockedUntil - now) / 1000);
      clientWindow.totalBlocked += 1;

      dfaManager.transition(clientKey, DFA_INPUTS.REJECT_ENFORCED, 'Active block window');

      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(clientWindow.blockedUntil / 1000));

      req.rateLimitExceeded = true;
      req.rejectionReason = `Rate limit exceeded. Temporary lock active. Retry in ${retryAfterSec}s.`;

      return res.status(429).json({
        success: false,
        message: 'HTTP 429 Too Many Requests: Rate limit quota exhausted.',
        error: `Maximum permitted rate of ${maxRequests} requests per ${windowSeconds}s exceeded.`,
        classification: 'Rate Limited',
        retryAfterSeconds: retryAfterSec,
        dfaState: 'S3',
        meta: {
          clientIpMasked: clientMasked,
          windowSeconds,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Clean up timestamps outside the active sliding window
    clientWindow.timestamps = this.cleanOldTimestamps(clientWindow.timestamps, windowMs, now);

    const currentUsage = clientWindow.timestamps.length;
    const remaining = Math.max(0, maxRequests - currentUsage);
    const oldestTimestamp = clientWindow.timestamps[0] || now;
    const resetTimestamp = Math.ceil((oldestTimestamp + windowMs) / 1000);

    // Set standard rate-limiting response headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));
    res.setHeader('X-RateLimit-Reset', resetTimestamp);

    // Evaluate DFA state
    const inputSymbol = dfaManager.evaluateInput(currentUsage + 1, maxRequests, false, currentUsage >= Math.floor(maxRequests * 0.7));
    dfaManager.transition(clientKey, inputSymbol, `Current usage: ${currentUsage + 1}/${maxRequests}`);

    // If quota exceeded, enforce temporary rate limit
    if (currentUsage >= maxRequests) {
      const blockDurationMs = (settings.quarantineDurationSeconds || 60) * 1000;
      clientWindow.blockedUntil = now + blockDurationMs;
      clientWindow.totalBlocked += 1;
      const retryAfterSec = Math.ceil(blockDurationMs / 1000);

      dfaManager.transition(clientKey, DFA_INPUTS.LIMIT_BREACH, `Breached quota: ${currentUsage + 1} requests`);
      dfaManager.transition(clientKey, DFA_INPUTS.REJECT_ENFORCED, 'HTTP 429 rejection enforced');

      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Remaining', 0);

      req.rateLimitExceeded = true;
      req.rejectionReason = `Quota exceeded: ${currentUsage}/${maxRequests} reqs per ${windowSeconds}s.`;

      // Persist to store if MongoDB is connected or sync to memory
      memoryStore.setRateLimitRecord(clientKey, {
        clientKey,
        clientIpMasked: clientMasked,
        totalRequestsCount: currentUsage + 1,
        totalBlockedCount: clientWindow.totalBlocked,
        isBlocked: true,
        blockedUntil: new Date(clientWindow.blockedUntil),
      });

      return res.status(429).json({
        success: false,
        message: 'HTTP 429 Too Many Requests: Rate limit exceeded.',
        error: `Client exceeded maximum allowance of ${maxRequests} requests per ${windowSeconds} seconds.`,
        classification: 'Rate Limited',
        retryAfterSeconds: retryAfterSec,
        dfaState: 'S3',
        meta: {
          clientIpMasked: clientMasked,
          windowSeconds,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Record this valid timestamp in the sliding window
    clientWindow.timestamps.push(now);

    req.rateLimitInfo = {
      currentUsage: clientWindow.timestamps.length,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - clientWindow.timestamps.length),
      resetTimestamp,
    };

    next();
  }

  resetClient(clientKey) {
    if (this.inMemoryWindows.has(clientKey)) {
      this.inMemoryWindows.delete(clientKey);
    }
    dfaManager.transition(clientKey, DFA_INPUTS.RECOVERY_COMPLETE, 'Administrative reset');
  }

  getActiveClients() {
    const now = Date.now();
    const settings = memoryStore.getSettings();
    const windowMs = (settings.slidingWindowSeconds || 60) * 1000;
    const maxRequests = settings.maxRequestsPerMinute || 100;

    const list = [];
    for (const [key, data] of this.inMemoryWindows.entries()) {
      const activeTimestamps = this.cleanOldTimestamps(data.timestamps, windowMs, now);
      const isBlocked = !!(data.blockedUntil && data.blockedUntil > now);
      list.push({
        clientKey: key,
        clientIpMasked: maskIpAddress(key),
        activeRequests: activeTimestamps.length,
        maxLimit: maxRequests,
        utilizationPercent: Math.min(100, Math.round((activeTimestamps.length / maxRequests) * 100)),
        isBlocked,
        blockedUntil: data.blockedUntil ? new Date(data.blockedUntil).toISOString() : null,
        totalBlocked: data.totalBlocked,
        dfaState: dfaManager.getClientState(key).currentState,
      });
    }
    return list;
  }
}

export const rateLimiterEngine = new SlidingWindowRateLimiter();

export function rateLimitMiddleware(req, res, next) {
  rateLimiterEngine.checkLimit(req, res, next);
}
