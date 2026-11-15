/**
 * Analytics and Metric Aggregation Service
 * Powers dashboard cards, time-series charts, and traffic distributions.
 */

import { memoryStore } from '../config/db.js';

export function getDashboardStats() {
  const logs = memoryStore.getLogs({}, 1000);
  const total = logs.length;

  if (total === 0) {
    return {
      totalRequests: 0,
      requestsPerMinute: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      avgResponseTimeMs: 0,
      successRatePercent: 100,
      activeClientsCount: 0,
      totalAlerts: 0,
    };
  }

  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const recentLogs = logs.filter(l => new Date(l.timestamp).getTime() > oneMinuteAgo);
  const requestsPerMinute = recentLogs.length;

  const blocked = logs.filter(l => l.statusCode === 429 || l.statusCode === 403).length;
  const suspicious = logs.filter(l => l.classification === 'Suspicious' || l.classification === 'Warning').length;
  const successful = logs.filter(l => l.statusCode >= 200 && l.statusCode < 400).length;

  const totalTime = logs.reduce((acc, curr) => acc + (curr.responseTimeMs || 0), 0);
  const avgResponseTimeMs = Math.round((totalTime / total) * 100) / 100;
  const successRatePercent = total > 0 ? Math.round((successful / total) * 1000) / 10 : 100;

  const uniqueClients = new Set(logs.map(l => l.clientIpRaw)).size;
  const totalAlerts = memoryStore.getAlerts(100).length;

  return {
    totalRequests: total,
    requestsPerMinute,
    blockedRequests: blocked,
    suspiciousRequests: suspicious,
    avgResponseTimeMs,
    successRatePercent,
    activeClientsCount: uniqueClients,
    totalAlerts,
  };
}

export function getAnalyticsData() {
  const logs = memoryStore.getLogs({}, 1000);

  // 1. HTTP Status Code Distribution
  const statusCodeCounts = { '2xx (Success)': 0, '3xx (Redirect)': 0, '4xx (Client Error)': 0, '429 (Rate Limited)': 0, '5xx (Server Error)': 0 };
  for (const log of logs) {
    const code = log.statusCode;
    if (code === 429) statusCodeCounts['429 (Rate Limited)'] += 1;
    else if (code >= 200 && code < 300) statusCodeCounts['2xx (Success)'] += 1;
    else if (code >= 300 && code < 400) statusCodeCounts['3xx (Redirect)'] += 1;
    else if (code >= 400 && code < 500) statusCodeCounts['4xx (Client Error)'] += 1;
    else if (code >= 500) statusCodeCounts['5xx (Server Error)'] += 1;
  }

  const statusDistribution = Object.entries(statusCodeCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // 2. Request Method Distribution
  const methodCounts = { GET: 0, POST: 0, PUT: 0, DELETE: 0, OTHER: 0 };
  for (const log of logs) {
    if (methodCounts[log.method] !== undefined) {
      methodCounts[log.method] += 1;
    } else {
      methodCounts.OTHER += 1;
    }
  }

  const methodDistribution = Object.entries(methodCounts).map(([method, count]) => ({
    method,
    count,
  }));

  // 3. Time Series Data (Group into last 12 intervals of 1 minute each)
  const now = Date.now();
  const intervals = 12;
  const intervalDurationMs = 60000;
  const timeSeries = [];

  for (let i = intervals - 1; i >= 0; i--) {
    const start = now - (i + 1) * intervalDurationMs;
    const end = now - i * intervalDurationMs;
    const bucketLogs = logs.filter(l => {
      const t = new Date(l.timestamp).getTime();
      return t >= start && t < end;
    });

    const allowed = bucketLogs.filter(l => l.statusCode < 400).length;
    const blocked = bucketLogs.filter(l => l.statusCode === 429 || l.statusCode === 403).length;
    const suspiciousCount = bucketLogs.filter(l => l.classification === 'Suspicious').length;

    const timeLabel = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    timeSeries.push({
      time: timeLabel,
      total: bucketLogs.length,
      allowed,
      blocked,
      suspicious: suspiciousCount,
    });
  }

  // 4. Classification Breakdown
  const classificationCounts = { Normal: 0, Warning: 0, Suspicious: 0, 'Rate Limited': 0 };
  for (const log of logs) {
    if (classificationCounts[log.classification] !== undefined) {
      classificationCounts[log.classification] += 1;
    }
  }

  return {
    statusDistribution,
    methodDistribution,
    timeSeries,
    classificationCounts,
  };
}
