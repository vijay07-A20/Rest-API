import React, { useState } from 'react';
import { Gauge, Clock, ShieldCheck, RefreshCw, AlertOctagon, CheckCircle2, RotateCcw } from 'lucide-react';
import { apiService } from '../../services/api';

export function RateLimitSection({ rateLimitStatus, settings, onRefresh }) {
  const [resettingIp, setResettingIp] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);

  const maxRequests = settings?.maxRequestsPerMinute || 100;
  const windowSec = settings?.slidingWindowSeconds || 60;
  const clients = rateLimitStatus?.clients || [];

  const handleResetClient = async (clientKey) => {
    setResettingIp(clientKey);
    setResetMessage(null);
    try {
      const res = await apiService.resetClientLimit(clientKey);
      if (res.ok) {
        setResetMessage(`Quota for ${clientKey} restored.`);
        onRefresh();
      } else {
        setResetMessage(`Failed to reset: ${res.error}`);
      }
    } catch (e) {
      setResetMessage(`Error: ${e.message}`);
    } finally {
      setResettingIp(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          Sliding Window Counter Rate Limiting Engine
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Deterministic token quota enforcement per client IP with RFC 6585 compliance and automated cooldown
        </p>
      </div>

      {resetMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          {resetMessage}
        </div>
      )}

      {/* Engine Status Parameters */}
      <div className="grid-cols-3">
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gauge size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Permitted Quota
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', marginTop: '8px', color: '#f8fafc' }}>
            {maxRequests} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>reqs</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Per client per sliding evaluation window
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#3b82f6" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Sliding Window Duration
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', marginTop: '8px', color: '#f8fafc' }}>
            {windowSec} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>seconds</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Granular microsecond sliding timestamp buffer
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon size={20} color="#ef4444" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              HTTP Breach Response
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', marginTop: '8px', color: '#f87171' }}>
            HTTP 429
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Includes Retry-After & X-RateLimit-* headers
          </p>
        </div>
      </div>

      {/* RFC Headers Explanation Panel */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'rgba(15, 23, 42, 0.9)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
          RFC 6585 & IETF RateLimit Headers Emitted by Middleware
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Whenever rate limits are enforced, Sentinel injects standard HTTP telemetry into the response stream:
        </p>

        <div className="grid-cols-4" style={{ gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700' }}>Retry-After</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Seconds client must wait before sending another request</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>X-RateLimit-Limit</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Maximum permitted request quota in the active sliding window</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700' }}>X-RateLimit-Remaining</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Remaining quota before HTTP 429 containment activates</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#a855f7', fontWeight: '700' }}>X-RateLimit-Reset</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Unix epoch timestamp when sliding window expires</div>
          </div>
        </div>
      </div>

      {/* Active Tracked Clients Table */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
              Active Client Sliding Windows & Quota Tracking
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Real-time consumption counters per IP. Quotas reset automatically as timestamps age out.
            </p>
          </div>
          <button onClick={onRefresh} className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>
            <RefreshCw size={13} /> Refresh Counters
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Client IP (Masked)</th>
                <th>Requests in Window</th>
                <th>Quota Consumed</th>
                <th>Quarantine / Lock Status</th>
                <th>Retry-After (s)</th>
                <th>Total 429 Drops</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => {
                const consumed = c.requestsInWindow || 0;
                const pct = Math.min(100, Math.round((consumed / maxRequests) * 100));
                const isBlocked = c.isBlocked;

                return (
                  <tr key={c.clientKey || i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                      {c.clientMasked || c.clientKey}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700' }}>
                      {consumed} / {maxRequests}
                    </td>
                    <td style={{ width: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {isBlocked ? (
                        <span className="badge badge-danger">Quarantined</span>
                      ) : pct > 70 ? (
                        <span className="badge badge-warning">Elevated</span>
                      ) : (
                        <span className="badge badge-success">Nominal</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: isBlocked ? '#f87171' : 'var(--text-dim)' }}>
                      {c.retryAfterSeconds > 0 ? `${c.retryAfterSeconds}s remaining` : '0s'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {c.totalBlocked || 0}
                    </td>
                    <td>
                      <button
                        onClick={() => handleResetClient(c.clientKey)}
                        disabled={resettingIp === c.clientKey}
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      >
                        <RotateCcw size={12} />
                        {resettingIp === c.clientKey ? 'Resetting...' : 'Reset Quota'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No active clients in memory. Run a simulation to populate sliding windows.
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
