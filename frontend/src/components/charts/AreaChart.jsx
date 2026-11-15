import React, { useState } from 'react';

export function AreaChart({ data = [], height = 220, color = '#38bdf8', title }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        No historical telemetry available
      </div>
    );
  }

  const values = data.map((d) => d.count || d.value || 0);
  const max = Math.max(...values, 10);
  const width = 600;
  const padding = 25;

  const points = values.map((val, idx) => {
    const x = padding + (idx / (values.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (val / max) * (height - 2 * padding);
    return { x, y, val, label: data[idx].time || data[idx].label || `#${idx + 1}` };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h4>
          {hoverIndex !== null && (
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color }}>
              {points[hoverIndex].label}: <strong>{points[hoverIndex].val} reqs</strong>
            </span>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`areaGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = height - padding - pct * (height - 2 * padding);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
              <text x={padding - 6} y={y + 4} fill="var(--text-dim)" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                {Math.round(pct * max)}
              </text>
            </g>
          );
        })}

        {/* Filled gradient area */}
        <path d={areaD} fill={`url(#areaGrad-${color})`} />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points & hover triggers */}
        {points.map((p, idx) => (
          <g key={idx} onMouseEnter={() => setHoverIndex(idx)}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? 5 : 3}
              fill={hoverIndex === idx ? '#fff' : color}
              stroke={color}
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
