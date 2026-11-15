import React from 'react';

export function MethodBadge({ method }) {
  const m = (method || 'GET').toUpperCase();
  const colors = {
    GET: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const style = colors[m] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';

  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: '700',
        fontFamily: 'var(--font-mono)',
        border: '1px solid',
        display: 'inline-block',
      }}
      className={style}
    >
      {m}
    </span>
  );
}

export function StatusBadge({ status }) {
  const code = parseInt(status, 10);
  let color = 'rgba(56, 189, 248, 0.2)';
  let textColor = '#38bdf8';
  let borderColor = 'rgba(56, 189, 248, 0.4)';

  if (code >= 200 && code < 300) {
    color = 'rgba(16, 185, 129, 0.15)';
    textColor = '#34d399';
    borderColor = 'rgba(16, 185, 129, 0.3)';
  } else if (code >= 300 && code < 400) {
    color = 'rgba(59, 130, 246, 0.15)';
    textColor = '#60a5fa';
    borderColor = 'rgba(59, 130, 246, 0.3)';
  } else if (code === 429) {
    color = 'rgba(239, 68, 68, 0.25)';
    textColor = '#f87171';
    borderColor = 'rgba(239, 68, 68, 0.5)';
  } else if (code >= 400 && code < 500) {
    color = 'rgba(245, 158, 11, 0.15)';
    textColor = '#fbbf24';
    borderColor = 'rgba(245, 158, 11, 0.3)';
  } else if (code >= 500) {
    color = 'rgba(225, 29, 72, 0.2)';
    textColor = '#fda4af';
    borderColor = 'rgba(225, 29, 72, 0.4)';
  }

  return (
    <span
      style={{
        backgroundColor: color,
        color: textColor,
        border: `1px solid ${borderColor}`,
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        fontFamily: 'var(--font-mono)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {code}
    </span>
  );
}

export function ClassificationBadge({ classification }) {
  const c = classification || 'Normal';
  let badgeClass = 'badge-success';

  if (c === 'Warning') badgeClass = 'badge-warning';
  else if (c === 'Suspicious') badgeClass = 'badge-danger';
  else if (c === 'Rate Limited') badgeClass = 'badge-purple';

  return <span className={`badge ${badgeClass}`}>{c}</span>;
}

export function DfaStateBadge({ state }) {
  const s = state || 'S0';
  const colors = {
    S0: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#10b981', label: 'S0: Normal' },
    S1: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: '#f59e0b', label: 'S1: Warning' },
    S2: { bg: 'rgba(249, 115, 22, 0.2)', text: '#fb923c', border: '#f97316', label: 'S2: Breach' },
    S3: { bg: 'rgba(239, 68, 68, 0.25)', text: '#f87171', border: '#ef4444', label: 'S3: Limited (429)' },
    S4: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: '#3b82f6', label: 'S4: Recovery' },
  };

  const current = colors[s] || colors.S0;

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
        fontFamily: 'var(--font-mono)',
        boxShadow: `0 0 10px ${current.bg}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.border,
          boxShadow: `0 0 6px ${current.border}`,
        }}
      />
      {current.label}
    </span>
  );
}
