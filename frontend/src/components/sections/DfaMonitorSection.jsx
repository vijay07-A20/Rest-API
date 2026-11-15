import React from 'react';
import { GitCommit, ArrowRight, Layers, Database, Shield, CheckCircle } from 'lucide-react';
import { DfaStateBadge } from '../common/Badge';

export function DfaMonitorSection({ dfaState }) {
  const currentState = dfaState?.globalCurrentState || 'S0';
  const history = dfaState?.globalTransitionHistory || [];
  const pdaContext = dfaState?.pushdownAutomataContext || {};

  const states = [
    { id: 'S0', name: 'Normal', color: '#10b981', border: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', desc: 'Nominal traffic envelope, standard latency, zero drops.' },
    { id: 'S1', name: 'Freq Warning', color: '#f59e0b', border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', desc: 'Traffic velocity burst detected, approaching ceiling.' },
    { id: 'S2', name: 'Threshold Exceeded', color: '#f97316', border: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', desc: 'Sliding quota exhausted; defensive mitigations arming.' },
    { id: 'S3', name: 'Rate Limited', color: '#ef4444', border: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', desc: 'Active containment: rejecting subsequent requests with HTTP 429.' },
    { id: 'S4', name: 'Recovery', color: '#3b82f6', border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', desc: 'Cooldown timer active; probationary state before S0 return.' },
  ];

  // Formal transition table
  const transitionTable = [
    { state: 'S0 (Normal)', normal: 'S0', burst: 'S1', breach: 'S2', reject: 'S3', cooldown: 'S0', recovery: 'S0' },
    { state: 'S1 (Warning)', normal: 'S1', burst: 'S2', breach: 'S2', reject: 'S3', cooldown: 'S4', recovery: 'S0' },
    { state: 'S2 (Breach)', normal: 'S2', burst: 'S3', breach: 'S3', reject: 'S3', cooldown: 'S4', recovery: 'S0' },
    { state: 'S3 (Rate Limited)', normal: 'S3', burst: 'S3', breach: 'S3', reject: 'S3', cooldown: 'S4', recovery: 'S0' },
    { state: 'S4 (Recovery)', normal: 'S4', burst: 'S1', breach: 'S2', reject: 'S3', cooldown: 'S4', recovery: 'S0' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          Deterministic Finite Automaton (DFA) State Engine
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Formal mathematical state-machine controlling defensive API transitions without nondeterministic ambiguity
        </p>
      </div>

      {/* Formal Automata 5-Tuple Definition */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'rgba(15, 23, 42, 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <GitCommit size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
            Formal Automata Definition: M = (Q, Σ, δ, q₀, F)
          </h3>
        </div>

        <div className="grid-cols-2" style={{ gap: '16px', fontSize: '0.8rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Finite States Set (Q):</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc', marginTop: '4px' }}>
              Q = &#123; S0 (Normal), S1 (Freq Warning), S2 (Threshold Exceeded), S3 (Rate Limited), S4 (Recovery) &#125;
            </div>

            <div style={{ color: 'var(--text-dim)', fontWeight: '600', marginTop: '12px' }}>Input Alphabet (Σ):</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', marginTop: '4px' }}>
              Σ = &#123; NORMAL_REQ, BURST_DETECTED, LIMIT_BREACH, REJECT_ENFORCED, COOLDOWN_TICK, RECOVERY_COMPLETE &#125;
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Initial State (q₀):</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '4px' }}>
              q₀ = S0 (System starts in pristine nominal state)
            </div>

            <div style={{ color: 'var(--text-dim)', fontWeight: '600', marginTop: '12px' }}>Accepting / Terminal States (F):</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#f87171', marginTop: '4px' }}>
              F = &#123; S3 &#125; (Quarantined/Contained) and &#123; S0 &#125; (Equilibrium State)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual DFA State Diagram */}
      <div className="glass-panel" style={{ padding: '24px 30px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '20px' }}>
          Interactive Automata State Nodes & Live State Highlight
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {states.map((st, idx) => {
            const isCurrent = currentState === st.id;
            return (
              <React.Fragment key={st.id}>
                <div
                  style={{
                    flex: '1 1 180px',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: isCurrent ? st.bg : 'rgba(30, 41, 59, 0.4)',
                    border: `2px solid ${isCurrent ? st.border : 'rgba(255, 255, 255, 0.08)'}`,
                    boxShadow: isCurrent ? `0 0 25px ${st.bg}` : 'none',
                    transform: isCurrent ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                  }}
                >
                  {isCurrent && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '12px',
                        background: st.border,
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ACTIVE
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: st.border,
                        boxShadow: `0 0 8px ${st.border}`,
                      }}
                    />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: st.color }}>
                      {st.id}
                    </h4>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                    {st.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px', lineHeight: 1.4 }}>
                    {st.desc}
                  </div>
                </div>

                {idx < states.length - 1 && (
                  <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={18} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* State Transition Table δ(q, σ) */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
          Transition Table: δ(Current State, Input Symbol) → Next State
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
          Mathematically proves deterministic behavior: for every pair (State, Input) exactly one next state is mapped.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>State (q)</th>
                <th>NORMAL_REQ</th>
                <th>BURST_DETECTED</th>
                <th>LIMIT_BREACH</th>
                <th>REJECT_ENFORCED</th>
                <th>COOLDOWN_TICK</th>
                <th>RECOVERY_COMPLETE</th>
              </tr>
            </thead>
            <tbody>
              {transitionTable.map((row, i) => (
                <tr key={i} style={{ backgroundColor: row.state.startsWith(currentState) ? 'rgba(56, 189, 248, 0.08)' : 'transparent' }}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: row.state.startsWith(currentState) ? 'var(--accent-cyan)' : '#f8fafc' }}>
                    {row.state}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{row.normal}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>{row.burst}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#fb923c' }}>{row.breach}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>{row.reject}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>{row.cooldown}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{row.recovery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pushdown Automata (PDA) Sequence Stack & Transition History */}
      <div className="grid-cols-2">
        {/* Pushdown Automata Stack Visualizer */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={18} color="#c084fc" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
              Pushdown Automaton (PDA) Stack Monitor
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
            Tracks bounded LIFO interaction sequence to detect unbalanced operations and recursion attacks.
          </p>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '120px',
                minHeight: '160px',
                border: '2px dashed rgba(168, 85, 247, 0.4)',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '6px',
                background: 'rgba(168, 85, 247, 0.05)',
              }}
            >
              {pdaContext?.currentStack?.map((sym, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    background: sym === 'Z0' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.25)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    color: '#f8fafc',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                  }}
                >
                  {sym}
                </div>
              )) || (
                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', margin: 'auto' }}>
                  Z0 (Bottom)
                </div>
              )}
            </div>

            <div style={{ flex: 1, fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Stack Alphabet (Γ):</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#c084fc', marginTop: '2px' }}>
                  &#123; Z₀, AUTH_REQ, READ_OP, WRITE_OP, PRIVILEGED_PROBE &#125;
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Stack Depth Limit:</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc', marginTop: '2px' }}>
                  12 Elements (Bounded Safety Threshold)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Current Stack Top:</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '2px' }}>
                  {pdaContext?.stackTopSymbol || 'Z0 (Bottom of Stack)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transition Event Stream */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', marginBottom: '12px' }}>
            Recent DFA State Transition History
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            {history.slice(0, 10).map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8' }}>
                    {h.fromState} → {h.toState}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>({h.inputSymbol})</span>
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                  {new Date(h.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                No state transitions logged yet. Automaton is currently stable at S0.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
