import React, { useState } from 'react';
import { MethodBadge, StatusBadge, ClassificationBadge, DfaStateBadge } from '../common/Badge';
import { AreaChart } from '../charts/AreaChart';
import { DonutChart } from '../charts/DonutChart';
import { Activity, Play, Pause, Globe, Server, Shield, Filter } from 'lucide-react';

export function TrafficSection({ requests, stats, analytics }) {
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);

  let filtered = isPaused ? requests : requests;

  if (filterMethod !== 'ALL') {
    filtered = filtered.filter((r) => r.method.toUpperCase() === filterMethod);
  }

  if (filterStatus !== 'ALL') {
    if (filterStatus === '2XX') filtered = filtered.filter((r) => r.statusCode >= 200 && r.statusCode < 300);
    else if (filterStatus === '4XX') filtered = filtered.filter((r) => r.statusCode >= 400 && r.statusCode < 500 && r.statusCode !== 429);
    else if (filterStatus === '429') filtered = filtered.filter((r) => r.statusCode === 429);
    else if (filterStatus === '5XX') filtered = filtered.filter((r) => r.statusCode >= 500);
  }

  const methodDistribution = analytics?.methodDistribution || [
    { name: 'GET', value: 65, color: '#38bdf8' },
    { name: 'POST', value: 20, color: '#10b981' },
    { name: 'PUT', value: 10, color: '#f59e0b' },
    { name: 'DELETE', value: 5, color: '#ef4444' },
  ];

  const statusCodeBreakdown = analytics?.statusCodeBreakdown || [
    { name: '200 OK', value: 75, color: '#10b981' },
    { name: '400 Bad Req', value: 5, color: '#f59e0b' },
    { name: '403 Forbidden', value: 6, color: '#f97316' },
    { name: '404 Not Found', value: 8, color: '#6366f1' },
    { name: '429 Rate Limited', value: 6, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with stream control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
            API Traffic Telemetry & Network Inspector
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Layer 7 HTTP request flow with IPv4/IPv6 privacy masking and response metrics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem' }}
          >
            {isPaused ? <Play size={14} color="#10b981" /> : <Pause size={14} color="#fbbf24" />}
            {isPaused ? 'Resume Feed' : 'Pause Live Feed'}
          </button>
        </div>
      </div>

      {/* Traffic Summary Cards */}
      <div className="grid-cols-4">
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Traffic Velocity</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {stats?.requestsPerMinute || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>req/min</span>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Avg Round-Trip Time</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '4px' }}>
            {stats?.avgResponseTimeMs || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ms</span>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Delivery Ratio</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#a855f7', marginTop: '4px' }}>
            {stats?.successRatePercent || 100}% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>healthy</span>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Privacy Masking</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginTop: '6px' }}>
            SHA-256 Mask Active
          </div>
        </div>
      </div>

      {/* Charts Breakdown */}
      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <DonutChart data={statusCodeBreakdown} title="HTTP Status Code Distribution" size={160} />
        </div>
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <DonutChart data={methodDistribution} title="HTTP Method Distribution" size={160} />
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        {/* Filters bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Filter Stream:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: filterMethod === m ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                    border: filterMethod === m ? '1px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.1)',
                    color: filterMethod === m ? '#38bdf8' : 'var(--text-muted)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', '2XX', '4XX', '429', '5XX'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: filterStatus === s ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: filterStatus === s ? '1px solid #c084fc' : '1px solid rgba(148, 163, 184, 0.1)',
                  color: filterStatus === s ? '#c084fc' : 'var(--text-muted)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>Request URI</th>
                <th>Client IP (Privacy Form)</th>
                <th>IP Format</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Classification</th>
                <th>Detection Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => (
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
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        color: '#93c5fd',
                      }}
                    >
                      {req.ipVersion || (req.clientIpMasked?.includes(':') ? 'IPv6' : 'IPv4')}
                    </span>
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
                  <td style={{ fontSize: '0.75rem', color: req.rejectionReason ? '#f87171' : 'var(--text-dim)' }}>
                    {req.rejectionReason || 'Compliant with rate limits and grammar rules'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No requests match the selected filters.
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
