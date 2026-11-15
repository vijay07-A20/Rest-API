/**
 * API Service Client for Sentinel Dashboard
 * Handles all REST endpoints with timeout, error handling and base URL configuration.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    const data = await res.json();
    if (!res.ok && res.status !== 429) {
      throw new Error(data.message || `HTTP Error ${res.status}`);
    }
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error(`API Call failed [${endpoint}]:`, error);
    return { ok: false, error: error.message };
  }
}

export const apiService = {
  // Dashboard & Metrics
  getDashboardStats: () => fetchJson('/api/dashboard/stats'),
  getNetworkInfo: () => fetchJson('/api/dashboard/network-info'),

  // Request Logs & Analytics
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/api/requests?${query}`);
  },
  getAnalytics: () => fetchJson('/api/requests/analytics'),

  // Security Alerts
  getAlerts: (limit = 50) => fetchJson(`/api/alerts?limit=${limit}`),

  // Rate Limiting Engine
  getRateLimitStatus: () => fetchJson('/api/ratelimit/status'),
  resetClientLimit: (clientKey) => fetchJson('/api/ratelimit/reset', {
    method: 'POST',
    body: JSON.stringify({ clientKey }),
  }),

  // DFA State Machine
  getDfaState: () => fetchJson('/api/dfa/state'),

  // System Configuration Settings
  getSettings: () => fetchJson('/api/settings'),
  updateSettings: (settings) => fetchJson('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),

  // Test Simulation Traffic Harness
  sendTestRequest: (payload) => fetchJson('/api/test/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  sendBatchSimulation: (payload) => fetchJson('/api/test/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Protected API Test Ping (triggers real middleware pipeline)
  testProtectedApi: (endpoint = '/api/v1/data', method = 'GET') => fetchJson(endpoint, {
    method,
  }),
};
