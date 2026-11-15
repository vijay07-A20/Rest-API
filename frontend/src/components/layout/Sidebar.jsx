import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Gauge,
  AlertTriangle,
  GitCommit,
  ListOrdered,
  BarChart2,
  Settings,
  BookOpen,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar({ currentSection, onSelectSection, alertCount = 0 }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'traffic', label: 'Traffic Monitor', icon: Activity },
    { id: 'ratelimit', label: 'Rate Limiting', icon: Gauge },
    { id: 'abuse', label: 'Abuse Detection', icon: AlertTriangle, badge: alertCount > 0 ? alertCount : null },
    { id: 'dfa', label: 'DFA Automata', icon: GitCommit },
    { id: 'logs', label: 'Request Logs', icon: ListOrdered },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const academicItems = [
    { id: 'academic', label: 'Academic Mapping', icon: BookOpen },
    { id: 'harness', label: 'Traffic Simulator', icon: Terminal },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#0a0e17',
        borderRight: '1px solid var(--bg-card-border)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        paddingTop: '20px',
      }}
    >
      <div style={{ padding: '0 20px 24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={24} color="var(--accent-cyan)" />
          <span style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '0.04em', color: '#fff' }}>
            SENTINEL OS
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Network Layer 7 Defense
        </p>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 12px 8px 12px', fontWeight: '700' }}>
          Operations & Control
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    color: isActive ? '#38bdf8' : 'var(--text-muted)',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        borderRadius: '9999px',
                        padding: '1px 7px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '24px 12px 8px 12px', fontWeight: '700' }}>
          Academic & Lab Tools
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {academicItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                    color: isActive ? '#c084fc' : 'var(--text-muted)',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        <div>B.Tech IT Full Stack Project</div>
        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Vijay V • Senior Project</div>
      </div>
    </aside>
  );
}
