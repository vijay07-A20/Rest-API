import React from 'react';
import { BookOpen, Layers, Network, Cpu, Check, Info } from 'lucide-react';

export function AcademicConceptsSection() {
  const mappingTable = [
    {
      subject: 'Computer Networks',
      concept: 'OSI 7-Layer vs TCP/IP Mapping',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Monitors Layer 7 HTTP metadata, maps to Layer 4 TCP stream context, extracts IP addresses and protocols.',
    },
    {
      subject: 'Computer Networks',
      concept: 'IPv4 & IPv6 Address Handling',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Extracts remote client IPs supporting both 32-bit dotted-decimal IPv4 and 128-bit colon-hexadecimal IPv6 with SHA-256 privacy masking.',
    },
    {
      subject: 'Computer Networks',
      concept: 'HTTP Methods & Status Codes',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Full RFC 7231 & 6585 compliance: GET, POST, PUT, DELETE methods; status codes 200, 400, 403, 404, 429 Too Many Requests.',
    },
    {
      subject: 'Computer Networks',
      concept: 'TCP Congestion Control Comparison',
      implementationStatus: 'Theoretically Compared & Telemetry Linked',
      implementationDetails: 'System explicitly contrasts Layer 7 token buckets with Layer 4 TCP AIMD (Additive Increase Multiplicative Decrease) and Congestion Window (cwnd).',
    },
    {
      subject: 'Computer Networks',
      concept: 'Quality of Service (QoS) & Priority Tiers',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Priority classification differentiating whitelisted critical system traffic from public untrusted consumers.',
    },
    {
      subject: 'Automata Theory (FLAT)',
      concept: 'Deterministic Finite Automaton (DFA)',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Formal 5-tuple M = (Q, Sigma, delta, q0, F) with 5 discrete operational states (S0-S4) and deterministic delta transition table.',
    },
    {
      subject: 'Automata Theory (FLAT)',
      concept: 'Pushdown Automata (PDA) Sequence Stack',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Bounded LIFO stack Gamma = {Z0, READ_OP, WRITE_OP, AUTH_REQ} detecting unbalanced syntactic request sequences and stack recursion.',
    },
    {
      subject: 'Automata Theory (FLAT)',
      concept: 'Regular Grammars & Lexical Regex Filter',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Chomsky Type-3 regular expressions strictly validating HTTP method alphabets, URI paths, UUID tokens, and path traversal tokens.',
    },
    {
      subject: 'Full Stack Web Dev',
      concept: 'React.js Component Architecture',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Modular UI with stateful hooks, SVG charting, real-time Server-Sent Events (SSE), and cyber dark navy theme.',
    },
    {
      subject: 'Full Stack Web Dev',
      concept: 'Express.js Middleware Security Pipeline',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Sequential middleware chain: RequestLogger -> RegexValidator -> PdaMonitor -> DfaEngine -> AbuseDetector -> RateLimiter.',
    },
    {
      subject: 'Full Stack Web Dev',
      concept: 'MongoDB / Mongoose Datastore Design',
      implementationStatus: 'Fully Implemented',
      implementationDetails: 'Mongoose schemas (ApiLog, RateLimitRecord, AbuseAlert, ClientActivity, SystemSettings) with indexes and in-memory dual fallback.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          Interdisciplinary Academic Concepts Integration
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Comprehensive curriculum mapping across Full Stack Web Development, Computer Networks, and Automata Theory
        </p>
      </div>

      {/* 3 Subject Feature Panels */}
      <div className="grid-cols-3">
        <div className="glass-panel" style={{ padding: '20px 24px', borderTop: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <Layers size={18} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800' }}>1. Full Stack Web Development</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Production-grade client-server separation using React.js, Express.js middleware pipeline architecture, Mongoose schemas with indexed collections, and real-time Server-Sent Events (SSE).
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px', borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
            <Network size={18} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800' }}>2. Computer Networks</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Layer 7 HTTP application protocol mechanics, IPv4/IPv6 privacy masking, RFC 6585 rate headers, QoS priority tiers, and rigorous theoretical contrast between Application-level rate limiting and Transport-layer TCP Congestion Control.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px', borderTop: '3px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', marginBottom: '8px' }}>
            <Cpu size={18} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800' }}>3. Formal Languages & Automata</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Formal 5-tuple Deterministic Finite Automaton M = (Q, Σ, δ, q₀, F) governing system security states, bounded Pushdown Automata (PDA) stack sequence tracking, and Type-3 Regular Grammars for URI syntax enforcement.
          </p>
        </div>
      </div>

      {/* Network Theory: TCP vs Application Rate Limiting */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '10px' }}>
          Academic Clarification: TCP Congestion Control vs Application Rate Limiting
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          As required by rigorous computer networks principles, this system does <strong>not</strong> claim application middleware directly implements TCP congestion control. Here is the formal academic comparison:
        </p>

        <div className="grid-cols-2" style={{ gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>
              Transport Layer (Layer 4): TCP Congestion Control
            </h5>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.6, paddingLeft: '18px' }}>
              <li>Operates on raw byte packets, segments, and ACKs at the OS kernel level.</li>
              <li>Uses <strong>AIMD</strong> (Additive Increase / Multiplicative Decrease), Slow Start, and Fast Retransmit.</li>
              <li>Regulates transmission rate based on network congestion, packet drop, and round-trip time (RTT).</li>
              <li>Has zero awareness of HTTP endpoints, user tokens, or application business logic.</li>
            </ul>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', marginBottom: '6px' }}>
              Application Layer (Layer 7): Sentinel Rate Limiter
            </h5>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.6, paddingLeft: '18px' }}>
              <li>Operates on parsed HTTP request URIs, methods, client identifiers, and IP addresses.</li>
              <li>Uses <strong>Sliding Window Counter</strong> algorithms and DFA state machines.</li>
              <li>Prevents server resource exhaustion, denial-of-service, brute-force attacks, and API scraping.</li>
              <li>Signals backpressure via <strong>HTTP 429 Too Many Requests</strong> and <code>Retry-After</code> headers.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Curriculum Mapping Table */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
          Comprehensive Subject-Wise Curriculum Mapping Table
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Formal validation checklist demonstrating exact syllabus mapping for B.Tech third-year project evaluation.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Academic Subject</th>
                <th>Syllabus Concept</th>
                <th>Implementation Status</th>
                <th>Real-World System Implementation</th>
              </tr>
            </thead>
            <tbody>
              {mappingTable.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    {row.subject}
                  </td>
                  <td style={{ fontWeight: '600', fontSize: '0.8rem', color: '#f8fafc' }}>
                    {row.concept}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: row.implementationStatus.includes('Fully') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: row.implementationStatus.includes('Fully') ? '#34d399' : '#38bdf8',
                        border: `1px solid ${row.implementationStatus.includes('Fully') ? '#10b981' : '#38bdf8'}`,
                      }}
                    >
                      {row.implementationStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {row.implementationDetails}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
