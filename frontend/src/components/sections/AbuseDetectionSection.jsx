import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, Bug, Lock, ShieldAlert, Cpu } from 'lucide-react';
import { ClassificationBadge } from '../common/Badge';

export function AbuseDetectionSection({ alerts, onSimulate }) {
  const heuristicRules = [
    {
      id: 'BURST_VELOCITY',
      name: 'Rapid Burst Velocity Analysis',
      threshold: '> 20 requests in 3 seconds',
      action: 'Elevates DFA to S1 / S2 and engages dynamic throttle',
      weight: '25 pts',
      icon: Flame,
      color: '#f59e0b',
    },
    {
      id: 'ENDPOINT_FUZZING',
      name: '4xx Endpoint Scanner & Fuzzer Detection',
      threshold: 'Repeated 404/400 errors exceeding 50% ratio',
      action: 'Marks client as Suspicious and quarantines endpoint access',
      weight: '35 pts',
      icon: Bug,
      color: '#ef4444',
    },
    {
      id: 'RESTRICTED_PROBE',
      name: 'Privileged & Administrative Reconnaissance',
      threshold: 'Targeting /admin, /.env, /config, /system paths',
      action: 'Immediate security alert and IP quarantine',
      weight: '40 pts',
      icon: Lock,
      color: '#a855f7',
    },
    {
      id: 'GRAMMAR_BREACH',
      name: 'Lexical Automata & Regex Grammar Filter',
      threshold: 'Path traversal (..), SQL injection tokens, or XSS tags',
      action: 'RFC HTTP 400 rejection and DFA security violation flag',
      weight: '35 pts',
      icon: Cpu,
      color: '#38bdf8',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
            Explainable Abuse Detection Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Multi-heuristic rule evaluation classifying behavioral patterns without black-box false positives
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSimulate('MALICIOUS_FUZZER', 20)}
            className="btn btn-danger"
            style={{ fontSize: '0.8rem' }}
          >
            <Bug size={14} /> Simulate 404 Fuzzer
          </button>
          <button
            onClick={() => onSimulate('RESTRICTED_PROBE', 10)}
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem' }}
          >
            <Lock size={14} /> Simulate Admin Probe
          </button>
        </div>
      </div>

      {/* 4 Classification Buckets */}
      <div className="grid-cols-4">
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>Normal</h4>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Traffic conforming strictly to regular grammars and normal quota consumption envelopes.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>Warning</h4>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Approaching sliding quota ceiling or intermittent client errors without deliberate malice.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>Suspicious</h4>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Directory traversal syntax, fuzzing signatures, or unauthorized admin probing detected.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>Rate Limited</h4>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Client has depleted token bucket. Actively quarantined with HTTP 429 containment.
          </p>
        </div>
      </div>

      {/* Heuristic Rules Matrix */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '14px' }}>
          Active Heuristic Inspection Rules
        </h3>
        <div className="grid-cols-2" style={{ gap: '14px' }}>
          {heuristicRules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: rule.color,
                    height: 'fit-content',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc' }}>{rule.name}</h5>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: rule.color, fontWeight: '700' }}>
                      Weight: {rule.weight}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Trigger Condition: <strong>{rule.threshold}</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                    Mitigation: {rule.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Alerts Stream */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
              Real-Time Security Incident Alerts
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Incidents generated when aggregate risk score crosses threshold
            </p>
          </div>
          <span className="badge badge-danger">
            {alerts.length} Incidents Logged
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Client IP (Masked)</th>
                <th>Rule Triggered</th>
                <th>Severity</th>
                <th>Risk Score</th>
                <th>Action Taken</th>
                <th>Details & Forensic Note</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alt, i) => (
                <tr key={alt._id || i}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(alt.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    {alt.clientIpMasked}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700' }}>
                    {alt.ruleTriggered}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: alt.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: alt.severity === 'HIGH' ? '#f87171' : '#fbbf24',
                        border: `1px solid ${alt.severity === 'HIGH' ? '#ef4444' : '#f59e0b'}`,
                      }}
                    >
                      {alt.severity}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: alt.riskScore > 70 ? '#f87171' : '#fbbf24' }}>
                        {alt.riskScore}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>/100</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{alt.actionTaken}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {alt.detectionDetails?.note || alt.detectionDetails?.scenario || 'Heuristic violation triggered mitigation.'}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No security alerts triggered. System operating within nominal parameters.
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
