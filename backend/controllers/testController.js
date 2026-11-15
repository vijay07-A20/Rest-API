/**
 * Safe, Bounded Traffic Simulation Controller
 * Generates controlled test traffic to demonstrate:
 * 1. Normal traffic within quota limits
 * 2. Rapid burst traffic intentionally tripping HTTP 429
 * 3. 404 fuzzer and endpoint scanner detection
 * 4. Restricted route probing
 * 5. Automata regex violations and PDA sequence tracking
 */

import { memoryStore } from '../config/db.js';
import { rateLimiterEngine } from '../middleware/rateLimiter.js';
import { dfaManager, DFA_INPUTS } from '../middleware/dfaEngine.js';
import { abuseDetector } from '../middleware/abuseDetector.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { maskIpAddress } from '../utils/ipUtils.js';

export function sendSingleTestRequest(req, res) {
  const { simulatedType = 'NORMAL', customPath = '/api/products', simulatedIp = '198.51.100.42' } = req.body;

  let statusCode = 200;
  let classification = 'Normal';
  let rejectionReason = null;
  const maskedIp = maskIpAddress(simulatedIp);

  if (simulatedType === 'INVALID_ENDPOINT') {
    statusCode = 404;
    classification = 'Warning';
    rejectionReason = 'Non-existent simulated endpoint';
  } else if (simulatedType === 'RESTRICTED_PROBE') {
    statusCode = 403;
    classification = 'Suspicious';
    rejectionReason = 'Administrative endpoint probe detected';
  } else if (simulatedType === 'REGEX_VIOLATION') {
    statusCode = 400;
    classification = 'Suspicious';
    rejectionReason = 'Path traversal syntax (..) detected by regex validator';
  }

  const logEntry = {
    requestId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    clientIpRaw: simulatedIp,
    clientIpMasked: maskedIp,
    ipVersion: 'IPv4',
    networkScope: 'Public Internet (Simulated)',
    method: 'GET',
    endpoint: customPath,
    statusCode,
    responseTimeMs: Math.floor(Math.random() * 45) + 5,
    userAgent: 'Sentinel-Simulation-Agent/1.0',
    contentLength: 512,
    dfaState: dfaManager.globalCurrentState,
    classification,
    rejectionReason,
    networkLayer: {
      applicationProtocol: 'HTTP/1.1',
      transportProtocol: 'TCP',
      qosPriorityTier: 'SIMULATED',
    },
    timestamp: new Date(),
  };

  memoryStore.insertLog(logEntry);

  return successResponse(res, {
    simulatedLog: logEntry,
    dfaState: dfaManager.globalCurrentState,
  }, `Simulated test request (${simulatedType}) generated successfully.`);
}

export function sendBatchSimulation(req, res) {
  const { scenario = 'BURST_ATTACK', count = 120, simulatedIp = '203.0.113.19' } = req.body;

  // Enforce safety bound: max 200 requests per simulation run
  const boundedCount = Math.min(200, Math.max(5, parseInt(count, 10) || 50));
  const settings = memoryStore.getSettings();
  const maxLimit = settings.maxRequestsPerMinute || 100;
  const maskedIp = maskIpAddress(simulatedIp);

  const results = {
    totalSent: boundedCount,
    allowed: 0,
    rejected: 0,
    scenario,
    simulatedIp: maskedIp,
    logsGenerated: [],
  };

  const now = Date.now();

  for (let i = 0; i < boundedCount; i++) {
    let statusCode = 200;
    let classification = 'Normal';
    let rejectionReason = null;
    let endpoint = '/api/v1/resource';

    if (scenario === 'BURST_ATTACK') {
      endpoint = '/api/v1/data';
      if (i >= maxLimit) {
        statusCode = 429;
        classification = 'Rate Limited';
        rejectionReason = `Simulated limit exceeded (${i + 1}/${maxLimit})`;
        results.rejected += 1;
        dfaManager.transition(simulatedIp, DFA_INPUTS.LIMIT_BREACH, 'Simulated batch quota exceeded');
        dfaManager.transition(simulatedIp, DFA_INPUTS.REJECT_ENFORCED, 'Simulated 429 enforcement');
      } else {
        statusCode = 200;
        results.allowed += 1;
        if (i >= Math.floor(maxLimit * 0.7)) {
          dfaManager.transition(simulatedIp, DFA_INPUTS.BURST_DETECTED, 'Simulated traffic velocity warning');
        }
      }
    } else if (scenario === 'MALICIOUS_FUZZER') {
      const endpoints = ['/api/admin/passwords', '/api/config/.env', '/api/v2/wp-login', '/api/debug/dump', '/api/users/../../etc/passwd'];
      endpoint = endpoints[i % endpoints.length];
      statusCode = 404;
      classification = 'Suspicious';
      rejectionReason = 'Automated directory fuzzing probe';
      results.rejected += 1;
    } else if (scenario === 'RESTRICTED_PROBE') {
      endpoint = '/api/admin/users';
      statusCode = 403;
      classification = 'Suspicious';
      rejectionReason = 'Unauthorized attempt to access privileged endpoint';
      results.rejected += 1;
    } else {
      // Normal flow
      endpoint = `/api/catalog/item/${(i % 10) + 1}`;
      statusCode = 200;
      results.allowed += 1;
    }

    const log = {
      requestId: `batch_${now}_${i}`,
      clientIpRaw: simulatedIp,
      clientIpMasked: maskedIp,
      ipVersion: 'IPv4',
      networkScope: 'Public Internet (Simulated)',
      method: i % 4 === 0 ? 'POST' : 'GET',
      endpoint,
      statusCode,
      responseTimeMs: Math.floor(Math.random() * 30) + 8,
      userAgent: 'Automated-Simulation-Harness/2.0',
      contentLength: 256,
      dfaState: dfaManager.globalCurrentState,
      classification,
      rejectionReason,
      networkLayer: {
        applicationProtocol: 'HTTP/1.1',
        transportProtocol: 'TCP',
        qosPriorityTier: 'SIMULATED',
      },
      timestamp: new Date(now - (boundedCount - i) * 150),
    };

    memoryStore.insertLog(log);
    if (i < 15 || i >= boundedCount - 5) {
      results.logsGenerated.push(log);
    }
  }

  // Trigger alert if fuzzer or restricted probe scenario
  if (scenario === 'MALICIOUS_FUZZER' || scenario === 'RESTRICTED_PROBE') {
    memoryStore.insertAlert({
      clientIpMasked: maskedIp,
      clientIpRaw: simulatedIp,
      severity: 'HIGH',
      ruleTriggered: scenario === 'MALICIOUS_FUZZER' ? 'REPEATED_4XX_FUZZING' : 'RESTRICTED_ENDPOINT_PROBE',
      riskScore: 85,
      detectionDetails: {
        scenario,
        totalRequests: boundedCount,
        note: 'Simulated security attack scenario executed via Test Harness.',
      },
      actionTaken: 'QUARANTINED',
      status: 'ACTIVE',
    });
  }

  return successResponse(res, {
    ...results,
    dfaCurrentState: dfaManager.globalCurrentState,
  }, `Batch simulation for '${scenario}' with ${boundedCount} requests executed safely.`);
}
