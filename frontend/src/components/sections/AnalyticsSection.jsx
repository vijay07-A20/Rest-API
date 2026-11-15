import React from 'react';
import { AreaChart } from '../charts/AreaChart';
import { StackedBarChart } from '../charts/BarChart';
import { DonutChart } from '../charts/DonutChart';
import { BarChart2, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

export function AnalyticsSection({ analytics, stats }) {
  const requestsOverTime = analytics?.requestsOverTime || [
    { label: '-30m', value: 14 },
    { label: '-25m', value: 22 },
    { label: '-20m', value: 31 },
    { label: '-15m', value: 45 },
    { label: '-10m', value: 89 },
    { label: '-5m', value: 120 },
    { label: 'Now', value: 65 },
  ];

  const allowedVsBlocked = analytics?.allowedVsBlocked || [
    { label: '-25m', allowed: 30, blocked: 1 },
    { label: '-20m', allowed: 42, blocked: 3 },
    { label: '-15m', allowed: 68, blocked: 7 },
    { label: '-10m', allowed: 95, blocked: 25 },
    { label: '-5m', allowed: 110, blocked: 10 },
    { label: 'Now', allowed: 60, blocked: 5 },
  ];

  const statusCodeBreakdown = analytics?.statusCodeBreakdown || [
    { name: '200 OK', value: 140, color: '#10b981' },
    { name: '400 Bad Request', value: 12, color: '#f59e0b' },
    { name: '403 Forbidden', value: 8, color: '#f97316' },
    { name: '404 Not Found', value: 18, color: '#6366f1' },
    { name: '429 Rate Limited', value: 22, color: '#ef4444' },
  ];

  const methodDistribution = analytics?.methodDistribution || [
    { name: 'GET', value: 110, color: '#38bdf8' },
    { name: 'POST', value: 45, color: '#10b981' },
    { name: 'PUT', value: 25, color: '#f59e0b' },
    { name: 'DELETE', value: 12, color: '#ef4444' },
  ];

  const suspiciousTimeline = [
    { label: '-25m', value: 1 },
    { label: '-20m', value: 3 },
    { label: '-15m', value: 8 },
    { label: '-10m', value: 19 },
    { label: '-5m', value: 5 },
    { label: 'Now', value: 2 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          Deep Telemetry Analytics & Behavioral Distribution
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Statistical aggregation of API request patterns, mitigation ratios, and error distributions
        </p>
      </div>

      {/* Row 1: Area Chart & Stacked Bar Chart */}
      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <AreaChart data={requestsOverTime} height={220} color="#38bdf8" title="API Request Traffic Over Time (Volume)" />
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <StackedBarChart data={allowedVsBlocked} height={220} title="Traffic Delivery: Allowed vs Blocked (HTTP 429 Drops)" />
        </div>
      </div>

      {/* Row 2: Status Code & Method Distributions */}
      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <DonutChart data={statusCodeBreakdown} size={170} title="HTTP Status Code Breakdown" />
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <DonutChart data={methodDistribution} size={170} title="HTTP Method Distribution" />
        </div>
      </div>

      {/* Row 3: Suspicious Activity Timeline */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldAlert size={18} color="#f59e0b" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
            Suspicious Activity Velocity Timeline
          </h4>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Chronological anomaly spikes detected by heuristic rules (directory traversals, fuzzers, and rapid burst scans).
        </p>
        <AreaChart data={suspiciousTimeline} height={180} color="#f59e0b" />
      </div>
    </div>
  );
}
