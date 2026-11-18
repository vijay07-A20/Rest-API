import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, getApiUrl, API_CONFIG_ERROR } from '../services/api';

export function useDashboardData(pollIntervalMs = 3000) {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dfaState, setDfaState] = useState(null);
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [settings, setSettings] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const eventSourceRef = useRef(null);

  // Fetch core metrics
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        statsRes,
        reqRes,
        alertRes,
        dfaRes,
        rlRes,
        settRes,
        netRes,
        analyticsRes,
      ] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRequests({ limit: 40 }),
        apiService.getAlerts(30),
        apiService.getDfaState(),
        apiService.getRateLimitStatus(),
        apiService.getSettings(),
        apiService.getNetworkInfo(),
        apiService.getAnalytics(),
      ]);

      if (statsRes.ok) setStats(statsRes.data.data);
      if (reqRes.ok) setRequests(reqRes.data.data.requests || []);
      if (alertRes.ok) setAlerts(alertRes.data.data.alerts || []);
      if (dfaRes.ok) setDfaState(dfaRes.data.data);
      if (rlRes.ok) setRateLimitStatus(rlRes.data.data);
      if (settRes.ok) setSettings(settRes.data.data);
      if (netRes.ok) setNetworkInfo(netRes.data.data);
      if (analyticsRes.ok) setAnalytics(analyticsRes.data.data);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Dashboard Hook] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Connect Server-Sent Events (SSE) Stream
  useEffect(() => {
    let sse;
    if (API_CONFIG_ERROR) {
      console.error(`[API Configuration] ${API_CONFIG_ERROR}`);
      setIsConnected(false);
      return undefined;
    }

    try {
      sse = new EventSource(getApiUrl('/api/stream/events'));
      eventSourceRef.current = sse;

      sse.onopen = () => {
        setIsConnected(true);
      };

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_LOG') {
            setRequests((prev) => [payload.log, ...prev.slice(0, 49)]);
          } else if (payload.type === 'NEW_ALERT') {
            setAlerts((prev) => [payload.alert, ...prev.slice(0, 29)]);
          } else if (payload.type === 'DFA_TRANSITION') {
            setDfaState((prev) => (prev ? { ...prev, globalCurrentState: payload.toState } : prev));
          }
        } catch (e) {
          // ignore non-json pings
        }
      };

      sse.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      setIsConnected(false);
    }

    return () => {
      if (sse) sse.close();
    };
  }, []);

  // Fallback Polling interval
  useEffect(() => {
    refreshData();
    const timer = setInterval(() => {
      refreshData();
    }, pollIntervalMs);

    return () => clearInterval(timer);
  }, [refreshData, pollIntervalMs]);

  return {
    stats,
    requests,
    alerts,
    dfaState,
    rateLimitStatus,
    settings,
    networkInfo,
    analytics,
    isConnected,
    isRefreshing,
    lastUpdated,
    refreshData,
  };
}


