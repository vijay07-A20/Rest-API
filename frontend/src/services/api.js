/**
 * API Service Client for Sentinel Dashboard
 * Handles all REST endpoints with timeout, error handling and base URL configuration.
 */

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
export let API_BASE = '';
export let API_CONFIG_ERROR = null;

if (!configuredApiUrl && import.meta.env.PROD) {
  API_CONFIG_ERROR = 'VITE_API_URL is missing. Set it to the deployed backend origin in Vercel and redeploy.';
} else if (configuredApiUrl) {
  try {
    const backendUrl = new URL(configuredApiUrl);
    if (!['http:', 'https:'].includes(backendUrl.protocol) || !['', '/'].includes(backendUrl.pathname) || backendUrl.search || backendUrl.hash) {
      throw new Error('VITE_API_URL must be a backend origin only, without a path, query, or fragment.');
    }
    API_BASE = backendUrl.origin;
  } catch (error) {
    API_CONFIG_ERROR = `Invalid VITE_API_URL: ${error.message}`;
  }
}

export function getApiUrl(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function fetchJson(endpoint, options = {}) {
  if (API_CONFIG_ERROR) {
    console.error(`[API Configuration] ${API_CONFIG_ERROR}`);
    return { ok: false, error: API_CONFIG_ERROR };
  }

  const url = getApiUrl(endpoint);
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
    return fetchJson(`/api/requests${query ? `?${query}` : ''}`);
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

