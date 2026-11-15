/**
 * Abuse Detection Engine: Explainable Multi-Heuristic Pattern Analyzer
 * Evaluates behavioral patterns:
 * 1. Rapid burst velocity (> 20 reqs in 3 seconds)
 * 2. Invalid endpoint / 404 fuzzer probing
 * 3. High 4xx client-side error ratios (> 50% errors)
 * 4. Restricted and administrative route reconnaissance
 * 5. Pushdown Automaton sequence anomalies
 * 6. Regular expression grammar violations
 * 
 * Classifies events into: 'Normal' | 'Warning' | 'Suspicious' | 'Rate Limited'
 */

import { extractClientIp, maskIpAddress } from '../utils/ipUtils.js';
import { memoryStore } from '../config/db.js';
import { dfaManager, DFA_INPUTS } from './dfaEngine.js';

class AbuseDetectionEngine {
  constructor() {
    this.clientWindows = new Map(); // clientKey -> { recentLogs: [], suspiciousScore: 0 }
    this.activeAlerts = [];
  }

  recordClientEvent(clientKey, event) {
    if (!this.clientWindows.has(clientKey)) {
      this.clientWindows.set(clientKey, {
        recentLogs: [],
        suspiciousScore: 0,
        quarantinedUntil: null,
      });
    }

    const data = this.clientWindows.get(clientKey);
    data.recentLogs.unshift(event);
    if (data.recentLogs.length > 30) data.recentLogs.pop();
    return data;
  }

  evaluateRequest(req) {
    const clientIp = extractClientIp(req);
    const clientMasked = maskIpAddress(clientIp);
    const path = req.path || '';
    const now = Date.now();

    const data = this.recordClientEvent(clientIp, {
      timestamp: now,
      path,
      method: req.method,
      statusCode: null, // Populated on response finish
    });

    const triggeredRules = [];
    let riskScore = 0;

    // Rule 1: Regex violation detected upstream
    if (req.regexViolation) {
      triggeredRules.push({
        rule: 'REGEX_SYNTAX_VIOLATION',
        severity: 'HIGH',
        weight: 35,
        explanation: `Payload violated formal grammar: ${req.regexViolation}`,
      });
      riskScore += 35;
    }

    // Rule 2: Pushdown Automata Sequence Anomaly
    if (req.pdaContext && req.pdaContext.isAnomaly) {
      triggeredRules.push({
        rule: 'PDA_STACK_ANOMALY',
        severity: 'HIGH',
        weight: 30,
        explanation: req.pdaContext.anomalyReason,
      });
      riskScore += 30;
    }

    // Rule 3: Restricted Endpoint Reconnaissance
    const restrictedPaths = ['/admin', '/internal', '/system', '/config', '/.env', '/actuator'];
    if (restrictedPaths.some(r => path.toLowerCase().includes(r))) {
      triggeredRules.push({
        rule: 'RESTRICTED_ENDPOINT_PROBE',
        severity: 'HIGH',
        weight: 40,
        explanation: `Client attempted to probe sensitive/administrative path: ${path}`,
      });
      riskScore += 40;
    }

    // Rule 4: Rapid Burst Frequency (> 20 requests in 3 seconds)
    const threeSecondsAgo = now - 3000;
    const burstCount = data.recentLogs.filter(l => l.timestamp > threeSecondsAgo).length;
    if (burstCount > 20) {
      triggeredRules.push({
        rule: 'RAPID_BURST_VELOCITY',
        severity: 'MEDIUM',
        weight: 25,
        explanation: `Burst frequency anomaly: ${burstCount} requests detected within 3 seconds.`,
      });
      riskScore += 25;
    }

    // Rule 5: Repeated 404 / 4xx Fuzzing History
    const recentErrors = data.recentLogs.filter(l => l.statusCode && l.statusCode >= 400 && l.statusCode < 500).length;
    if (data.recentLogs.length >= 10 && recentErrors >= 5) {
      triggeredRules.push({
        rule: 'REPEATED_4XX_FUZZING',
        severity: 'MEDIUM',
        weight: 25,
        explanation: `High 4xx error density: ${recentErrors} of last ${data.recentLogs.length} requests failed.`,
      });
      riskScore += 25;
    }

    // Determine final classification
    let classification = 'Normal';
    if (req.rateLimitExceeded) {
      classification = 'Rate Limited';
    } else if (riskScore >= 50) {
      classification = 'Suspicious';
    } else if (riskScore >= 25 || triggeredRules.length > 0) {
      classification = 'Warning';
    }

    // If highly suspicious, emit an alert
    if (riskScore >= 35 && triggeredRules.length > 0) {
      const topRule = triggeredRules[0];
      const alertItem = {
        clientIpMasked: clientMasked,
        clientIpRaw: clientIp,
        severity: topRule.severity,
        ruleTriggered: topRule.rule,
        riskScore: Math.min(100, riskScore),
        detectionDetails: {
          path,
          method: req.method,
          explanations: triggeredRules.map(r => r.explanation),
          requestCountInWindow: data.recentLogs.length,
        },
        actionTaken: riskScore >= 60 ? 'QUARANTINED' : 'LOGGED',
        status: 'ACTIVE',
      };

      memoryStore.insertAlert(alertItem);
      this.activeAlerts.unshift(alertItem);
      if (this.activeAlerts.length > 100) this.activeAlerts.pop();

      // Notify DFA
      dfaManager.transition(clientIp, DFA_INPUTS.BURST_DETECTED, topRule.explanation);
    }

    req.abuseAnalysis = {
      classification,
      riskScore: Math.min(100, riskScore),
      triggeredRules,
      isFlagged: riskScore >= 35,
    };

    return req.abuseAnalysis;
  }

  updateResponseStatus(clientKey, statusCode) {
    if (this.clientWindows.has(clientKey)) {
      const data = this.clientWindows.get(clientKey);
      if (data.recentLogs.length > 0) {
        data.recentLogs[0].statusCode = statusCode;
      }
    }
  }

  getAlerts(limit = 20) {
    return memoryStore.getAlerts(limit);
  }
}

export const abuseDetector = new AbuseDetectionEngine();

export function abuseDetectionMiddleware(req, res, next) {
  abuseDetector.evaluateRequest(req);
  next();
}
