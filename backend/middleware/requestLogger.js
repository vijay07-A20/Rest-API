/**
 * Request Logger and Real-Time SSE Broadcaster
 * - Measures high-precision round-trip latency in milliseconds.
 * - Gathers OSI Network Layer metadata (L7 HTTP, L4 TCP, L3 IPv4/IPv6, QoS).
 * - Persists request logs into dual-layer storage (MongoDB and MemoryStore).
 * - Broadcasts real-time events to connected dashboard clients via Server-Sent Events (SSE).
 */

import { extractClientIp, maskIpAddress, detectIpVersion, classifyNetworkScope } from '../utils/ipUtils.js';
import { enrichNetworkContext } from '../services/networkContextService.js';
import { memoryStore } from '../config/db.js';
import { ApiLog } from '../models/ApiLog.js';
import { dfaManager } from './dfaEngine.js';
import { abuseDetector } from './abuseDetector.js';

// SSE Clients Registry
export const sseClients = new Set();

export function broadcastSseEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  for (const client of sseClients) {
    try {
      client.write(`event: ${eventType}\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

export function requestLogger(req, res, next) {
  const startNano = process.hrtime.bigint();
  const clientIp = extractClientIp(req);
  const clientMasked = maskIpAddress(clientIp);
  const ipVersion = detectIpVersion(clientIp);
  const networkScope = classifyNetworkScope(clientIp);
  const networkContext = enrichNetworkContext(req);

  res.on('finish', async () => {
    const endNano = process.hrtime.bigint();
    const responseTimeMs = Number(endNano - startNano) / 1_000_000;
    const roundedLatency = Math.round(responseTimeMs * 100) / 100;

    const statusCode = res.statusCode;
    const contentLength = parseInt(res.getHeader('content-length') || 0, 10);
    const userAgent = req.headers['user-agent'] || 'Direct API Client';

    // Update abuse detector with response status
    abuseDetector.updateResponseStatus(clientIp, statusCode);

    // Determine final classification
    let classification = req.abuseAnalysis?.classification || 'Normal';
    if (statusCode === 429) {
      classification = 'Rate Limited';
    } else if (statusCode >= 400 && classification === 'Normal') {
      classification = 'Warning';
    }

    const currentDfaState = dfaManager.getClientState(clientIp).currentState;

    const logEntry = {
      requestId: req.requestId || `req_${Date.now()}`,
      clientIpRaw: clientIp,
      clientIpMasked: clientMasked,
      ipVersion,
      networkScope,
      method: req.method,
      endpoint: req.originalUrl || req.path,
      statusCode,
      responseTimeMs: roundedLatency,
      userAgent,
      contentLength,
      dfaState: currentDfaState,
      classification,
      rejectionReason: req.rejectionReason || (statusCode === 429 ? 'Rate limit exceeded' : null),
      networkLayer: networkContext,
      timestamp: new Date(),
    };

    // Store in memory datastore for fast real-time reads
    const savedLog = memoryStore.insertLog(logEntry);

    // Persist to MongoDB asynchronously if connected
    ApiLog.create(logEntry).catch(() => {});

    // Broadcast SSE update to frontend
    broadcastSseEvent('REQUEST_LOG', {
      ...savedLog,
      dfaState: currentDfaState,
    });
  });

  next();
}
