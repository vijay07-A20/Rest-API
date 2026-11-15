import React from 'react';
import { Shield, Radio, Database, RefreshCw, Cpu, Zap } from 'lucide-react';
import { DfaStateBadge } from '../common/Badge';

export function Navbar({ isConnected, isRefreshing, onRefresh, dfaState, stats, onOpenSimModal }) {
  const dbStatus = stats?.databaseStatus || 'Connecting...';
  const isMongo = dbStatus.includes('MongoDB');

  return (
    <header
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--bg-card-border)',
        backgroundColor: 'rgba(10, 14, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
            }}
          >
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.01em', color: '#f8fafc' }}>
              SENTINEL <span style={{ color: 'var(--accent-cyan)', fontWeight: '600', fontSize: '0.85rem' }}>v2.4</span>
            </h1>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              API Rate Limiting & Abuse Detection System
            </p>
          </div>
        </div>

        {/* Global DFA State Badge in Top Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>
            System Automaton:
          </span>
          <DfaStateBadge state={dfaState?.globalCurrentState || 'S0'} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Real-time SSE Stream Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            color: isConnected ? '#34d399' : '#fbbf24',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Radio size={12} className={isConnected ? 'pulse-indicator' : ''} />
          {isConnected ? 'LIVE SSE STREAM' : 'POLLING MODE'}
        </div>

        {/* Database Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: isMongo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)',
            border: `1px solid ${isMongo ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
            color: isMongo ? '#34d399' : '#38bdf8',
            fontFamily: 'var(--font-mono)',
          }}
          title={dbStatus}
        >
          <Database size={12} />
          {isMongo ? 'MONGODB ATLAS' : 'IN-MEMORY DB'}
        </div>

        {/* Traffic Simulation Trigger Button */}
        <button
          onClick={onOpenSimModal}
          className="btn btn-primary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <Zap size={14} />
          Simulate Traffic
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          className="btn btn-ghost"
          style={{ padding: '7px 10px' }}
          title="Refresh Data Now"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
}
