import React from 'react';

export function DonutChart({ data = [], size = 180, thickness = 22, title }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        No distribution data
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.value || d.count || 0), 0) || 1;
  const radius = size / 2 - 10;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const defaultColors = ['#10b981', '#38bdf8', '#f59e0b', '#ef4444', '#a855f7', '#6366f1'];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px' }}>{title}</h4>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              {data.map((slice, idx) => {
                const val = slice.value || slice.count || 0;
                const percent = val / total;
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += percent;

                const color = slice.color || defaultColors[idx % defaultColors.length];

                return (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={thickness}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dasharray 0.4s ease' }}
                  />
                );
              })}
            </g>
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{total}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxWidth: '180px' }}>
          {data.map((d, i) => {
            const val = d.value || d.count || 0;
            const pct = Math.round((val / total) * 100);
            const color = d.color || defaultColors[i % defaultColors.length];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                  {d.label || d.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#f8fafc' }}>
                  {val} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
