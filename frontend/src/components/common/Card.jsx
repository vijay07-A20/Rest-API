import React from 'react';

export function StatCard({ title, value, unit, subtitle, icon: Icon, color = '#38bdf8', trend }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Subtle top color accent border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              {value ?? '—'}
            </h2>
            {unit && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              background: `rgba(255, 255, 255, 0.03)`,
              border: `1px solid rgba(255, 255, 255, 0.06)`,
              color: color,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {subtitle}
        </p>
        {trend !== undefined && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              color: trend >= 0 ? '#34d399' : '#f87171',
            }}
          >
            {trend >= 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>
    </div>
  );
}
