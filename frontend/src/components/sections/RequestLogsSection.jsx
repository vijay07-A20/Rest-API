import React, { useState } from 'react';
import { MethodBadge, StatusBadge, ClassificationBadge, DfaStateBadge } from '../common/Badge';
import { Search, Filter, Eye, X, Terminal, Globe, Server, Layers } from 'lucide-react';

export function RequestLogsSection({ requests }) {
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [inspectModalLog, setInspectModalLog] = useState(null);

  const filtered = requests.filter((r) => {
    // Search filter
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      r.endpoint?.toLowerCase().includes(s) ||
      r.clientIpMasked?.toLowerCase().includes(s) ||
      r.rejectionReason?.toLowerCase().includes(s) ||
      r.requestId?.toLowerCase().includes(s);

    // Method filter
    const matchMethod = selectedMethod === 'ALL' || r.method?.toUpperCase() === selectedMethod;

    // Status filter
    const matchStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === '200' && r.statusCode === 200) ||
      (selectedStatus === '400' && r.statusCode === 400) ||
      (selectedStatus === '403' && r.statusCode === 403) ||
      (selectedStatus === '404' && r.statusCode === 404) ||
      (selectedStatus === '429' && r.statusCode === 429);

    // Classification filter
    const matchClassification =
      selectedClassification === 'ALL' || r.classification?.toLowerCase() === selectedClassification.toLowerCase();

    return matchSearch && matchMethod && matchStatus && matchClassification;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          API Request Telemetry Audit Logs
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Deep inspection of incoming HTTP requests with layered network metadata and automata telemetry
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search endpoint, IP, request ID, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Method filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>Method:</span>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: '0.78rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: '0.78rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Codes</option>
            <option value="200">200 OK</option>
            <option value="400">400 Bad Request</option>
            <option value="403">403 Forbidden</option>
            <option value="404">404 Not Found</option>
            <option value="429">429 Rate Limited</option>
          </select>
        </div>

        {/* Classification filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>Class:</span>
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: '0.78rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Classifications</option>
            <option value="Normal">Normal</option>
            <option value="Warning">Warning</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Rate Limited">Rate Limited</option>
          </select>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> matching request events
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>Request Endpoint</th>
                <th>Client IP (Masked)</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Classification</th>
                <th>Detection Reason</th>
                <th>Inspect</th>
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
                    <StatusBadge status={req.statusCode} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {req.responseTimeMs} ms
                  </td>
                  <td>
                    <ClassificationBadge classification={req.classification} />
                  </td>
                  <td style={{ fontSize: '0.75rem', color: req.rejectionReason ? '#f87171' : 'var(--text-dim)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.rejectionReason || 'Nominal execution'}
                  </td>
                  <td>
                    <button
                      onClick={() => setInspectModalLog(req)}
                      className="btn btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      title="Inspect full request forensics"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No audit logs match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspection Modal Drawer */}
      {inspectModalLog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setInspectModalLog(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#0f172a',
              border: '1px solid var(--accent-cyan)',
              boxShadow: '0 0 35px rgba(56, 189, 248, 0.25)',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={20} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                  Forensic Telemetry Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectModalLog(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', fontSize: '0.82rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>REQUEST ID (RFC 4122)</span>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc', marginTop: '2px' }}>
                    {inspectModalLog.requestId}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>TIMESTAMP</span>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc', marginTop: '2px' }}>
                    {new Date(inspectModalLog.timestamp).toISOString()}
                  </div>
                </div>
              </div>

              {/* Network Context Layer */}
              <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: '700', fontSize: '0.75rem', marginBottom: '8px' }}>
                  <Globe size={14} /> COMPUTER NETWORKS CONTEXT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                  <div>Application Layer: <strong>{inspectModalLog.networkLayer?.applicationProtocol || 'HTTP/1.1'}</strong></div>
                  <div>Transport Layer: <strong>{inspectModalLog.networkLayer?.transportProtocol || 'TCP (Stream-Oriented)'}</strong></div>
                  <div>Client Address: <strong>{inspectModalLog.clientIpMasked} ({inspectModalLog.ipVersion || 'IPv4'})</strong></div>
                  <div>QoS Priority Tier: <strong>{inspectModalLog.networkLayer?.qosPriorityTier || 'STANDARD'}</strong></div>
                </div>
              </div>

              {/* Automata Layer */}
              <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontWeight: '700', fontSize: '0.75rem', marginBottom: '8px' }}>
                  <Layers size={14} /> AUTOMATA & FORMAL GRAMMAR CONTEXT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                  <div>DFA State at Evaluation: <DfaStateBadge state={inspectModalLog.dfaState || 'S0'} /></div>
                  <div>Classification: <ClassificationBadge classification={inspectModalLog.classification} /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    Rejection / Detection Reason:
                    <div style={{ color: inspectModalLog.rejectionReason ? '#f87171' : '#34d399', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {inspectModalLog.rejectionReason || 'Syntactically valid request within sliding window quota.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
