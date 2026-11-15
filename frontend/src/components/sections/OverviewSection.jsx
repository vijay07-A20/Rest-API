import React from 'react';
import { StatCard } from '../common/Card';
import { MethodBadge, StatusBadge, ClassificationBadge, DfaStateBadge } from '../common/Badge';
import { AreaChart } from '../charts/AreaChart';
import { StackedBarChart } from '../charts/BarChart';
import {
  Activity,
  Zap,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Flame,
  Shield,
  Layers,
} from 'lucide-react';

export function OverviewSection({ stats, requests, alerts, dfaState, analytics, onSelectSection, onSimulate }) {
  const total = stats?.totalRequests || 0;
  const rpm = stats?.requestsPerMinute || 0;
  const blocked = stats?.blockedRequests || 0;
  const suspicious = stats?.suspiciousRequests || 0;
  const avgLatency = stats?.avgResponseTimeMs || 0;
  const successRate = stats?.successRatePercent || 100;

  // Chart data from analytics service or fallback
  const trafficHistory = analytics?.requestsOverTime || [
    { label: '10:00', value: 12 },
    { label: '10:05', value: 19 },
    { label: '10:10', value: 24 },
    { label: '10:15', value: 38 },
    { label: '10:20', value: 65 },
    { label: '10:25', value: 42 },
  ];

  const allowedVsBlocked = analytics?.allowedVsBlocked || [
    { label: '-15m', allowed: 45, blocked: 2 },
    { label: '-10m', allowed: 72, blocked: 6 },
    { label: '-5m', allowed: 98, blocked: 18 },
    { label: 'Now', allowed: 60, blocked: 4 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 30px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 132, 199, 0.15))',
          borderLeft: '4px solid var(--accent-cyan)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc' }}>
              API Sentinel Live Defense Console
            </h2>
            <DfaStateBadge state={dfaState?.globalCurrentState || 'S0'} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', maxWidth: '750px' }}>
            Multi-layered REST API protection uniting <strong>Full Stack Engineering</strong>, <strong>Computer Networks</strong> (Layer 7 & QoS), and <strong>Formal Automata</strong> (5-state DFA, PDA sequence stack & regex grammars).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSimulate('BURST_ATTACK', 120)}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <Flame size={15} /> Trigger 429 Burst
          </button>
          <button
            onClick={() => onSelectSection('academic')}
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem' }}
          >
            <Layers size={15} /> View Academic Mappings
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (6 Cards) */}
      <div className="grid-cols-3">
        <StatCard
          title="Total API Requests"
          value={total.toLocaleString()}
          subtitle="Lifetime telemetry logs"
          icon={Activity}
          color="#38bdf8"
        />
        <StatCard
          title="Requests Per Minute (RPM)"
          value={rpm}
          unit="req/min"
          subtitle="Current traffic velocity"
          icon={Zap}
          color="#3b82f6"
          trend={12}
        />
        <StatCard
          title="Blocked Requests"
          value={blocked.toLocaleString()}
          subtitle="HTTP 429 rate limit drops"
          icon={AlertOctagon}
          color="#ef4444"
        />
        <StatCard
          title="Suspicious Requests"
          value={suspicious.toLocaleString()}
          subtitle="Anomalies & scanner probes"
          icon={ShieldAlert}
          color="#f59e0b"
        />
        <StatCard
          title="Avg Response Time"
          value={avgLatency}
          unit="ms"
          subtitle="Server round-trip latency"
          icon={Clock}
          color="#10b981"
        />
        <StatCard
          title="API Success Rate"
          value={`${successRate}%`}
          subtitle="2xx HTTP delivery ratio"
          icon={CheckCircle2}
          color="#a855f7"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <AreaChart data={trafficHistory} title="Real-Time API Traffic Volume (Req / Interval)" height={210} color="#38bdf8" />
        </div>
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <StackedBarChart data={allowedVsBlocked} title="Allowed vs Blocked Rate Limit Rejections" height={210} />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
              Recent API Telemetry Feed
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Incoming HTTP requests evaluated in real-time by middleware pipeline
            </p>
          </div>
          <button
            onClick={() => onSelectSection('logs')}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            View Full Audit Logs <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Client IP (Masked)</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Classification</th>
                <th>DFA State</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 7).map((req, i) => (
                <tr key={req.requestId || i}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(req.timestamp).toLocaleTimeString()}
                  </td>
                  <td>
                    <MethodBadge method={req.method} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    {req.endpoint}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {req.clientIpMasked}
                  </td>
                  <td>
                    <StatusBadge status={req.statusCode} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {req.responseTimeMs} ms
                  </td>
                  <td>
                    <ClassificationBadge classification={req.classification} />
                  </td>
                  <td>
                    <DfaStateBadge state={req.dfaState || 'S0'} />
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No incoming requests captured yet. Use the Traffic Simulator above to generate test load.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
