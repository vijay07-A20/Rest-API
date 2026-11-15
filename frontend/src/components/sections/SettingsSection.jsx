import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';

export function SettingsSection({ settings, onRefresh }) {
  const [formData, setFormData] = useState({
    maxRequestsPerMinute: 100,
    slidingWindowSeconds: 60,
    burstLimit: 25,
    quarantineDurationSeconds: 180,
    dfaStrictness: 'MODERATE',
    ipWhitelist: ['127.0.0.1', '::1'],
    ipBlacklist: [],
  });

  const [newWhitelistIp, setNewWhitelistIp] = useState('');
  const [newBlacklistIp, setNewBlacklistIp] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        maxRequestsPerMinute: settings.maxRequestsPerMinute ?? 100,
        slidingWindowSeconds: settings.slidingWindowSeconds ?? 60,
        burstLimit: settings.burstLimit ?? 25,
        quarantineDurationSeconds: settings.quarantineDurationSeconds ?? 180,
        dfaStrictness: settings.dfaStrictness ?? 'MODERATE',
        ipWhitelist: settings.ipWhitelist ?? ['127.0.0.1', '::1'],
        ipBlacklist: settings.ipBlacklist ?? [],
      });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await apiService.updateSettings(formData);
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'System security settings updated successfully.' });
        onRefresh();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const addWhitelistIp = () => {
    if (newWhitelistIp.trim() && !formData.ipWhitelist.includes(newWhitelistIp.trim())) {
      setFormData({ ...formData, ipWhitelist: [...formData.ipWhitelist, newWhitelistIp.trim()] });
      setNewWhitelistIp('');
    }
  };

  const removeWhitelistIp = (ip) => {
    setFormData({ ...formData, ipWhitelist: formData.ipWhitelist.filter((item) => item !== ip) });
  };

  const addBlacklistIp = () => {
    if (newBlacklistIp.trim() && !formData.ipBlacklist.includes(newBlacklistIp.trim())) {
      setFormData({ ...formData, ipBlacklist: [...formData.ipBlacklist, newBlacklistIp.trim()] });
      setNewBlacklistIp('');
    }
  };

  const removeBlacklistIp = (ip) => {
    setFormData({ ...formData, ipBlacklist: formData.ipBlacklist.filter((item) => item !== ip) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          Sentinel System Configuration & Threshold Controls
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Tune sliding window rates, DFA automata sensitivity, and network IP access lists
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: statusMessage.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Rate Limiting Parameters */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
            Rate Limiting Engine Parameters
          </h3>

          <div className="grid-cols-2" style={{ gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                MAX REQUESTS PER MINUTE (QUOTA CEILING)
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={formData.maxRequestsPerMinute}
                onChange={(e) => setFormData({ ...formData, maxRequestsPerMinute: parseInt(e.target.value, 10) || 100 })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Default: 100 reqs/min per client IP address.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                SLIDING WINDOW DURATION (SECONDS)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={formData.slidingWindowSeconds}
                onChange={(e) => setFormData({ ...formData, slidingWindowSeconds: parseInt(e.target.value, 10) || 60 })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Sliding timestamp window evaluation interval.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                BURST VELOCITY THRESHOLD
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.burstLimit}
                onChange={(e) => setFormData({ ...formData, burstLimit: parseInt(e.target.value, 10) || 25 })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Triggers DFA state transition from S0 to S1.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                QUARANTINE DURATION (SECONDS)
              </label>
              <input
                type="number"
                min="10"
                max="3600"
                value={formData.quarantineDurationSeconds}
                onChange={(e) => setFormData({ ...formData, quarantineDurationSeconds: parseInt(e.target.value, 10) || 180 })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Duration client remains in DFA state S3 before probation.
              </span>
            </div>
          </div>
        </div>

        {/* DFA Sensitivity Mode */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#c084fc', marginBottom: '12px' }}>
            DFA Automata Sensitivity Profile
          </h3>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {['PERMISSIVE', 'MODERATE', 'STRICT'].map((mode) => (
              <label
                key={mode}
                style={{
                  flex: '1 1 200px',
                  padding: '14px 18px',
                  borderRadius: '8px',
                  backgroundColor: formData.dfaStrictness === mode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                  border: formData.dfaStrictness === mode ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  type="radio"
                  name="dfaStrictness"
                  value={mode}
                  checked={formData.dfaStrictness === mode}
                  onChange={(e) => setFormData({ ...formData, dfaStrictness: e.target.value })}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>{mode}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {mode === 'PERMISSIVE' && 'Allows wider bursts before state change.'}
                    {mode === 'MODERATE' && 'Balanced operational curve (Standard).'}
                    {mode === 'STRICT' && 'Aggressively flags velocity spikes to S2/S3.'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* IP Access Control Lists */}
        <div className="grid-cols-2">
          {/* Whitelist */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#34d399', marginBottom: '10px' }}>
              IP Whitelist (Bypasses Rate Limits)
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="e.g. 192.168.1.100 or ::1"
                value={newWhitelistIp}
                onChange={(e) => setNewWhitelistIp(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                }}
              />
              <button type="button" onClick={addWhitelistIp} className="btn btn-ghost" style={{ padding: '6px 12px' }}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {formData.ipWhitelist.map((ip) => (
                <span
                  key={ip}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {ip}
                  <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeWhitelistIp(ip)} />
                </span>
              ))}
            </div>
          </div>

          {/* Blacklist */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f87171', marginBottom: '10px' }}>
              IP Blacklist (Immediate HTTP 403 Drop)
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="e.g. 203.0.113.50"
                value={newBlacklistIp}
                onChange={(e) => setNewBlacklistIp(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                }}
              />
              <button type="button" onClick={addBlacklistIp} className="btn btn-ghost" style={{ padding: '6px 12px' }}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {formData.ipBlacklist.map((ip) => (
                <span
                  key={ip}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {ip}
                  <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeBlacklistIp(ip)} />
                </span>
              ))}
              {formData.ipBlacklist.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No IPs currently blacklisted.</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} />
            {isSaving ? 'Applying Changes...' : 'Save Configuration Parameters'}
          </button>
        </div>
      </form>
    </div>
  );
}
