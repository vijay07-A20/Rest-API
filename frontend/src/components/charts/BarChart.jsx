import React from 'react';

export function StackedBarChart({ data = [], height = 220, title }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        No telemetry distribution available
      </div>
    );
  }

  const width = 600;
  const padding = 25;
  const maxTotal = Math.max(...data.map((d) => (d.allowed || 0) + (d.blocked || 0)), 15);
  const barWidth = Math.min(28, (width - 2 * padding) / data.length - 8);

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h4>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10b981' }} /> Allowed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }} /> Blocked / 429
            </span>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Gridlines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - padding - pct * (height - 2 * padding);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
              <text x={padding - 6} y={y + 4} fill="var(--text-dim)" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                {Math.round(pct * maxTotal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const total = (item.allowed || 0) + (item.blocked || 0);
          const x = padding + idx * ((width - 2 * padding) / data.length) + 6;
          const totalHeight = (total / maxTotal) * (height - 2 * padding);
          const allowedHeight = ((item.allowed || 0) / maxTotal) * (height - 2 * padding);
          const blockedHeight = ((item.blocked || 0) / maxTotal) * (height - 2 * padding);

          const allowedY = height - padding - allowedHeight;
          const blockedY = allowedY - blockedHeight;

          return (
            <g key={idx}>
              {/* Allowed segment */}
              <rect
                x={x}
                y={allowedY}
                width={barWidth}
                height={allowedHeight}
                fill="#10b981"
                rx="2"
                opacity="0.85"
              />
              {/* Blocked segment */}
              <rect
                x={x}
                y={blockedY}
                width={barWidth}
                height={blockedHeight}
                fill="#ef4444"
                rx="2"
                opacity="0.9"
              />
              {/* Time Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                fill="var(--text-dim)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {item.label || item.time || `#${idx + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
