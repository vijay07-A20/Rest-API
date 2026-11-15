/**
 * Computer Networks Academic Integration Service
 * Bridges application security with fundamental networking concepts:
 * 1. OSI 7-Layer Model (Application L7 vs Transport L4 vs Network L3)
 * 2. TCP/IP Architecture & Handshake Lifecycle
 * 3. TCP Congestion Control vs Application-Layer Rate Limiting
 * 4. Quality of Service (QoS) Tiering & Traffic Shaping
 */

export function enrichNetworkContext(req) {
  const applicationProtocol = req.httpVersion ? `HTTP/${req.httpVersion}` : 'HTTP/1.1';
  const transportProtocol = 'TCP';
  const destinationPort = req.socket.localPort || 5000;
  const sourcePort = req.socket.remotePort || null;

  // Derive QoS (Quality of Service) priority based on requested endpoint & client tier
  let qosPriorityTier = 'STANDARD';
  const path = req.path || req.originalUrl || '';

  if (path.startsWith('/api/health') || path.startsWith('/api/dashboard/stats')) {
    qosPriorityTier = 'CRITICAL_METRIC';
  } else if (req.headers['x-api-tier'] === 'premium') {
    qosPriorityTier = 'HIGH_PRIORITY_CLIENT';
  } else if (path.startsWith('/api/test')) {
    qosPriorityTier = 'CONTROLLED_SIMULATION';
  }

  return {
    applicationProtocol,
    transportProtocol,
    destinationPort,
    sourcePort,
    qosPriorityTier,
    osiReference: {
      layer7Application: `${applicationProtocol} (REST Payload / JSON)`,
      layer4Transport: `${transportProtocol} (Port: ${destinationPort})`,
      layer3Network: 'IP Protocol (IPv4/IPv6 Routing)',
    },
  };
}

/**
 * Educational comparison table for academic presentation
 * Distinguishes TCP Congestion Control from Application-Layer Rate Limiting
 */
export function getNetworkArchitectureComparison() {
  return {
    osiLayerMapping: [
      { layer: 7, name: 'Application', protocols: 'HTTP, REST, JSON', roleInProject: 'Rate limiting token buckets, DFA classification, Regex validation' },
      { layer: 6, name: 'Presentation', protocols: 'TLS / SSL, JSON Serialization', roleInProject: 'HTTPS encryption, payload decoding' },
      { layer: 5, name: 'Session', protocols: 'TCP Session, SSE, Keep-Alive', roleInProject: 'Persistent SSE stream for dashboard updates' },
      { layer: 4, name: 'Transport', protocols: 'TCP, UDP', roleInProject: 'Port multiplexing, reliability, three-way handshake' },
      { layer: 3, name: 'Network', protocols: 'IPv4, IPv6, ICMP', roleInProject: 'Client IP identification and privacy-preserving masking' },
      { layer: 2, name: 'Data Link', protocols: 'Ethernet, 802.11 Wi-Fi', roleInProject: 'Frame switching on local NIC' },
      { layer: 1, name: 'Physical', protocols: 'Copper, Fiber, Radio RF', roleInProject: 'Physical transmission medium' },
    ],
    congestionControlComparison: {
      tcpCongestionControl: {
        layer: 'Layer 4 (Transport Layer in OS Kernel)',
        mechanisms: ['Slow Start', 'Congestion Avoidance (AIMD)', 'Fast Retransmit', 'Fast Recovery (CUBIC/Reno)'],
        metric: 'Congestion Window (cwnd) & Round Trip Time (RTT)',
        reaction: 'Drops packets or reduces cwnd size to relieve intermediate network router congestion',
        awareness: 'Agnostic to HTTP URLs, methods, user identities, or application payloads',
      },
      applicationRateLimiting: {
        layer: 'Layer 7 (Application Layer in Express.js)',
        mechanisms: ['Sliding Window Counter', 'Token Bucket', 'Deterministic Finite Automaton (DFA)'],
        metric: 'Requests per minute (RPM) per client IP / API Key',
        reaction: 'Returns HTTP 429 Too Many Requests with Retry-After header and backpressure guidance',
        awareness: 'Full semantic awareness of API routes, HTTP methods, client identity, and payload format',
      },
      academicTakeaway: 'Application rate limiting does not replace TCP congestion control. Rather, it provides higher-layer semantic backpressure to prevent CPU and database exhaustion, complementing TCP transport reliability.',
    },
  };
}
