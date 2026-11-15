import React, { useState } from 'react';
import { Terminal, Play, Flame, Bug, Lock, ShieldCheck, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';
import { apiService } from '../../services/api';

export function TestHarnessSection({ onRefresh }) {
  const [isRunning, setIsRunning] = useState(false);
  const [batchCount, setBatchCount] = useState(120);
  const [batchScenario, setBatchScenario] = useState('BURST_ATTACK');
  const [simulatedIp, setSimulatedIp] = useState('203.0.113.19');
  const [consoleLogs, setConsoleLogs] = useState([
    '[Harness] Sentinel Controlled Simulation Engine initialized.',
    '[Harness] Ready to generate bounded test payloads for academic defense verification.',
  ]);

  const addLog = (msg) => {
    setConsoleLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const handleSingleTest = async (type) => {
    setIsRunning(true);
    addLog(`Sending single probe: type=${type}...`);

    let customPath = '/api/v1/products';
    if (type === 'INVALID_ENDPOINT') customPath = '/api/v1/non-existent-probe';
    else if (type === 'RESTRICTED_PROBE') customPath = '/api/v1/admin/superusers';
    else if (type === 'REGEX_VIOLATION') customPath = '/api/v1/files/../../../etc/shadow';

    try {
      const res = await apiService.sendTestRequest({
        simulatedType: type,
        customPath,
        simulatedIp,
      });

      if (res.ok) {
        addLog(`Response HTTP ${res.data.data?.simulatedLog?.statusCode} | Classification: ${res.data.data?.simulatedLog?.classification} | DFA: ${res.data.data?.dfaState}`);
        onRefresh();
      } else {
        addLog(`Probe failed: ${res.error}`);
      }
    } catch (e) {
      addLog(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleBatchTest = async () => {
    setIsRunning(true);
    addLog(`Initiating bounded batch simulation: scenario=${batchScenario}, count=${batchCount}...`);

    try {
      const res = await apiService.sendBatchSimulation({
        scenario: batchScenario,
        count: parseInt(batchCount, 10) || 50,
        simulatedIp,
      });

      if (res.ok) {
        const d = res.data.data;
        addLog(`Batch completed! Total sent: ${d.totalSent} | Allowed: ${d.allowed} | Dropped (429/403): ${d.rejected} | DFA Current: ${d.dfaCurrentState}`);
        onRefresh();
      } else {
        addLog(`Simulation error: ${res.error}`);
      }
    } catch (e) {
      addLog(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc' }}>
          Bounded Traffic Simulation Test Harness
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Safe, sandboxed traffic generation simulating real-world bursts, fuzzers, and quota breaches
        </p>
      </div>

      {/* Quick Single Probes Panel */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
          Single Request Forensic Probes
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Transmit individual requests to verify middleware pipeline behavior and state transitions:
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSingleTest('NORMAL')}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', background: '#0284c7' }}
          >
            <ShieldCheck size={14} /> Send Normal Request (200 OK)
          </button>

          <button
            onClick={() => handleSingleTest('INVALID_ENDPOINT')}
            disabled={isRunning}
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem' }}
          >
            <Bug size={14} /> Trigger 404 Endpoint Scanner
          </button>

          <button
            onClick={() => handleSingleTest('RESTRICTED_PROBE')}
            disabled={isRunning}
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem' }}
          >
            <Lock size={14} /> Probe Privileged /admin (403)
          </button>

          <button
            onClick={() => handleSingleTest('REGEX_VIOLATION')}
            disabled={isRunning}
            className="btn btn-danger"
            style={{ fontSize: '0.8rem' }}
          >
            <AlertOctagon size={14} /> Path Traversal (..) Regex Trip
          </button>
        </div>
      </div>

      {/* Batch Load Simulation Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '14px' }}>
          Automated Batch Load Attack Simulator
        </h3>

        <div className="grid-cols-3" style={{ gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>
              ATTACK SCENARIO
            </label>
            <select
              value={batchScenario}
              onChange={(e) => setBatchScenario(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.85rem',
              }}
            >
              <option value="BURST_ATTACK">Rapid Burst Quota Exhaustion (Trips HTTP 429)</option>
              <option value="MALICIOUS_FUZZER">Automated Directory Fuzzer Scan (404 Wave)</option>
              <option value="RESTRICTED_PROBE">Privileged Route Reconnaissance (403 Alert)</option>
              <option value="NORMAL_FLOW">Nominal Traffic Wave (Legitimate Load)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>
              REQUEST COUNT (SAFETY BOUND: MAX 200)
            </label>
            <input
              type="number"
              min="10"
              max="200"
              value={batchCount}
              onChange={(e) => setBatchCount(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>
              SIMULATED CLIENT IP
            </label>
            <input
              type="text"
              value={simulatedIp}
              onChange={(e) => setSimulatedIp(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleBatchTest}
          disabled={isRunning}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '0.85rem' }}
        >
          <Flame size={16} />
          {isRunning ? 'Simulating Batch Traffic...' : `Execute Safe Simulation (${batchCount} Requests)`}
        </button>
      </div>

      {/* Terminal Output Console */}
      <div className="glass-panel" style={{ padding: '20px 24px', backgroundColor: '#050811', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Terminal size={16} color="var(--accent-cyan)" />
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            SIMULATION TERMINAL OUTPUT
          </h4>
        </div>

        <div
          style={{
            height: '180px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: '#a7f3d0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {consoleLogs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
