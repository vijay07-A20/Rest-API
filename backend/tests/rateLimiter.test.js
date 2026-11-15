import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimiterEngine } from '../middleware/rateLimiter.js';
import { memoryStore } from '../config/db.js';

describe('Rate Limiter Engine Tests', () => {
  beforeEach(() => {
    // Reset system settings to known test limits
    memoryStore.updateSettings({
      maxRequestsPerMinute: 5,
      slidingWindowSeconds: 2,
      quarantineDurationSeconds: 3,
      ipWhitelist: [],
      ipBlacklist: [],
    });
    rateLimiterEngine.resetClient('192.0.2.1');
  });

  test('Permits requests within quota window', async () => {
    const testIp = '192.0.2.1';
    let passed = 0;

    for (let i = 0; i < 4; i++) {
      const req = {
        headers: {},
        socket: { remoteAddress: testIp },
        path: '/api/v1/test',
        method: 'GET',
      };
      const res = {
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; },
      };

      await rateLimiterEngine.checkLimit(req, res, () => {
        passed += 1;
      });
    }

    assert.equal(passed, 4, 'All 4 requests within limit should pass');
  });

  test('Blocks request and emits HTTP 429 when quota is breached', async () => {
    const testIp = '192.0.2.1';

    // Send 5 requests to consume capacity (limit = 5)
    for (let i = 0; i < 5; i++) {
      const req = { headers: {}, socket: { remoteAddress: testIp } };
      const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
      await rateLimiterEngine.checkLimit(req, res, () => {});
    }

    // 6th request must be rejected with 429
    const req = { headers: {}, socket: { remoteAddress: testIp } };
    let capturedCode = null;
    let capturedJson = null;
    const res = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(code) {
        capturedCode = code;
        return this;
      },
      json(data) {
        capturedJson = data;
        return this;
      },
    };

    let nextCalled = false;
    await rateLimiterEngine.checkLimit(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'Middleware must not call next() on rate limit breach');
    assert.equal(capturedCode, 429, 'Status code must be HTTP 429 Too Many Requests');
    assert.ok(res.headers['Retry-After'] > 0, 'Retry-After header must be present and positive');
    assert.equal(capturedJson?.classification, 'Rate Limited', 'Classification must be Rate Limited');
  });

  test('Manual client reset restores quota immediately', async () => {
    const testIp = '192.0.2.1';

    // Exhaust quota
    for (let i = 0; i < 6; i++) {
      const req = { headers: {}, socket: { remoteAddress: testIp } };
      const res = { headers: {}, setHeader() {}, status() { return this; }, json() { return this; } };
      await rateLimiterEngine.checkLimit(req, res, () => {});
    }

    // Reset client
    rateLimiterEngine.resetClient(testIp);

    // Next request should pass
    let passed = false;
    const req = { headers: {}, socket: { remoteAddress: testIp } };
    const res = { headers: {}, setHeader() {}, status() { return this; }, json() { return this; } };
    await rateLimiterEngine.checkLimit(req, res, () => {
      passed = true;
    });

    assert.equal(passed, true, 'Request immediately after reset should pass successfully');
  });
});
