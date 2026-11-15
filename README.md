# REST API Rate Limiting and Abuse Detection System (SENTINEL)

> **Interdisciplinary Full Stack Web Development, Computer Networks, and Formal Languages & Automata Theory Academic Capstone Project**  
> **Author:** Vijay V (B.Tech Information Technology, 3rd Year)  
> **Architecture:** Decoupled Client-Server (React.js + Express.js + MongoDB + Automata Engine)

---

## 1. Project Abstract & Objective

The **REST API Rate Limiting and Abuse Detection System (SENTINEL)** is an enterprise-grade cybersecurity and traffic management platform designed to monitor incoming HTTP requests, enforce sliding-window quotas, detect algorithmic API abuse patterns, and visualize system defense telemetry in real time.

Modern web services face unprecedented threats ranging from distributed denial-of-service (DDoS) bursts and credential stuffing to automated web scrapers and path traversal fuzzers. This system demonstrates how fundamental principles from **Computer Networks** (Layer 7 HTTP application semantics, IPv4/IPv6 privacy masking, Quality of Service tiers, and transport layer TCP congestion analogies) and **Formal Languages and Automata Theory** (Deterministic Finite Automata $M = (Q, \Sigma, \delta, q_0, F)$, Pushdown Automata bounded stack sequence monitors, and Type-3 Regular Grammars) are synthesized into a production **Full Stack Web Application**.

---

## 2. Technology Stack

| Domain | Technology / Library | Purpose & Academic Role |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js 18 (Vite)** | Reactive single-page cybersecurity dashboard, modular state hooks |
| **Styling** | **Custom Cyber Navy CSS** | Responsive dark navy/blue theme, glassmorphic cards, CSS animations |
| **Visualizations**| **Custom SVG Data Visualizers** | Zero-bloat real-time area sparklines, stacked bars, and donut charts |
| **Backend API** | **Node.js & Express.js** | Non-blocking asynchronous event loop, sequential middleware pipeline |
| **Database** | **MongoDB & Mongoose** | Document-oriented telemetry store with automated in-memory dual fallback |
| **Real-Time Stream**| **Server-Sent Events (SSE)** | Unidirectional persistent push channel (`/api/stream/events`) for live audit |
| **Testing** | **Node.js Test Runner (`node:test`)**| Native unit tests verifying DFA determinism and rate-limiting thresholds |
| **Deployment** | **Vercel & Render** | Frontend edge hosting (Vercel) and backend container service (Render) |

---

## 3. Core Architectural Modules

```
                    ┌───────────────────────────────────────────────┐
                    │               CLIENT REQUEST                  │
                    │         (Web Client / Mobile / Postman)       │
                    └───────────────────────┬───────────────────────┘
                                            │ HTTP / TCP
                                            ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS MIDDLEWARE PIPELINE                             │
│                                                                                   │
│  [1. Request Logger]      ──► Captures timestamp, masked IP, method, and URI      │
│  [2. Regex Validator]     ──► Chomsky Type-3 lexical filter (Path Traversal/XSS)  │
│  [3. PDA Sequence Monitor]──► Bounded LIFO stack checking operational balance     │
│  [4. DFA State Engine]    ──► Transitions between S0, S1, S2, S3, S4              │
│  [5. Abuse Detector]      ──► Multi-heuristic scoring (burst, fuzzer, probe)      │
│  [6. Rate Limiter]        ──► Sliding window counter (100 req/min, HTTP 429)     │
└───────────────────────────────────────────┬───────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
             Quota Breached                                   Quota Within Limit
                    │                                               │
                    ▼                                               ▼
       ┌────────────────────────┐                      ┌────────────────────────┐
       │   HTTP 429 Response    │                      │  Protected Controller  │
       │   Retry-After: 60s     │                      │      (200 / 201)       │
       │   X-RateLimit-* Header │                      │  Product / User Data   │
       └────────────────────────┘                      └────────────────────────┘
```

### A. Rate Limiting Engine (Sliding Window Counter)
- Evaluates client requests across a rolling microsecond timestamp window (default: **100 requests per 60 seconds**).
- When client quota is breached, rejects further requests with **HTTP 429 Too Many Requests**.
- Injects standard RFC 6585 and IETF headers:
  - `Retry-After`: Dynamic seconds remaining in quarantine.
  - `X-RateLimit-Limit`: Maximum permitted window quota.
  - `X-RateLimit-Remaining`: Available token allowance.
  - `X-RateLimit-Reset`: Unix epoch expiration timestamp.

### B. Multi-Heuristic Abuse Detection Engine
Classifies incoming traffic into **Normal**, **Warning**, **Suspicious**, and **Rate Limited** via explainable heuristic rules:
1. **Rapid Burst Velocity**: Flags clients transmitting $> 20$ requests in $< 3$ seconds.
2. **Endpoint Fuzzing**: Flags automated scanners triggering repeated 404/400 errors exceeding a 50% error ratio.
3. **Restricted Route Reconnaissance**: Detects unauthorized probes targeting `/admin`, `/.env`, `/config`, or `/system`.
4. **Lexical Grammar Violations**: Identifies directory traversal sequences (`../`), SQL injection fragments, or XSS vectors.

---

## 4. Formal Languages & Automata Theory (FLAT) Integration

### A. Deterministic Finite Automaton (DFA)
The system's defense lifecycle is formally modeled as a 5-tuple:
$$\mathcal{M} = (Q, \Sigma, \delta, q_0, F)$$

Where:
- **$Q$ (States):** $\{ S_0, S_1, S_2, S_3, S_4 \}$
  - $S_0$: **Normal** (Pristine state, within quota envelope)
  - $S_1$: **Request Frequency Warning** (Traffic velocity approaching ceiling)
  - $S_2$: **Threshold Exceeded** (Quota limit breached; arming mitigations)
  - $S_3$: **Temporarily Rate Limited** (Active containment rejecting via HTTP 429)
  - $S_4$: **Recovery** (Probationary cooldown before returning to equilibrium)
- **$\Sigma$ (Alphabet):** $\{ \text{NORMAL\_REQ}, \text{BURST\_DETECTED}, \text{LIMIT\_BREACH}, \text{REJECT\_ENFORCED}, \text{COOLDOWN\_TICK}, \text{RECOVERY\_COMPLETE} \}$
- **$q_0$ (Initial State):** $S_0$
- **$F$ (Accepting/Terminal States):** $\{ S_3 \}$ (Defensive containment) and $\{ S_0 \}$ (Nominal equilibrium)
- **$\delta$ (Transition Function):** Formally defined in the transition matrix below:

| Current State ($q$) | NORMAL_REQ | BURST_DETECTED | LIMIT_BREACH | REJECT_ENFORCED | COOLDOWN_TICK | RECOVERY_COMPLETE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **$S_0$ (Normal)** | $S_0$ | $S_1$ | $S_2$ | $S_3$ | $S_0$ | $S_0$ |
| **$S_1$ (Warning)** | $S_1$ | $S_2$ | $S_2$ | $S_3$ | $S_4$ | $S_0$ |
| **$S_2$ (Breach)** | $S_2$ | $S_3$ | $S_3$ | $S_3$ | $S_4$ | $S_0$ |
| **$S_3$ (Rate Limited)** | $S_3$ | $S_3$ | $S_3$ | $S_3$ | $S_4$ | $S_0$ |
| **$S_4$ (Recovery)** | $S_4$ | $S_1$ | $S_2$ | $S_3$ | $S_4$ | $S_0$ |

### B. Pushdown Automaton (PDA) Sequence Monitor
Modeled as $\mathcal{M}_{pda} = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ with stack alphabet $\Gamma = \{ Z_0, \text{AUTH\_REQ}, \text{READ\_OP}, \text{WRITE\_OP}, \text{PRIVILEGED\_PROBE} \}$. The bounded LIFO stack monitors client conversational grammar ($S \to \text{Init } A \text{ Complete}$). Repeated recursive calls without matching pop reductions trip a bounded stack overflow anomaly ($depth > 12$), neutralizing fuzzer crawl loops.

### C. Type-3 Regular Grammars & Regex Validation
Strict regular expressions enforce lexical syntax constraints before execution:
- HTTP Method Grammar: `/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$/`
- URI Path Grammar: `/^\/api(\/[a-zA-Z0-9_\-]+)*\/?$/`
- Directory Traversal Filter: `/(?:\.\.\/|\.\.\\)/i`

---

## 5. Computer Networks Concepts Integration

1. **OSI 7-Layer Architecture:**
   - **Layer 7 (Application):** HTTP/1.1 and HTTP/2 protocol parsing, header serialization, URI evaluation, status code dispatching.
   - **Layer 4 (Transport):** TCP connection tracking, socket remote addressing, simulated congestion interaction.
   - **Layer 3 (Network):** Dual-stack IPv4 (32-bit dotted-decimal) and IPv6 (128-bit colon-hexadecimal) detection with SHA-256 privacy anonymization.
2. **TCP Congestion Control vs. Application-Level Rate Limiting:**
   - *Academic Clarification:* Application-level rate limiting does **not** directly implement TCP congestion control (AIMD/cwnd). Instead, Layer 4 TCP regulates packet-level flow across network links, whereas Sentinel enforces Layer 7 application token allowances, communicating server backpressure via HTTP 429 semantics.
3. **Quality of Service (QoS):** Priority tiering classifying whitelisted administrative nodes, authenticated standard users, and untrusted public clients.

---

## 6. REST API Endpoints Specification

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | High-level system telemetry (RPM, latency, 429 drops) | Public Monitoring |
| `GET` | `/api/requests` | Paginated and filtered API audit log stream | Public Monitoring |
| `GET` | `/api/requests/analytics` | Statistical distributions for Chart.js / SVG visualizers | Public Monitoring |
| `GET` | `/api/alerts` | Security incidents and heuristic alert feed | Public Monitoring |
| `GET` | `/api/ratelimit/status` | Active client sliding windows & tokens remaining | Public Monitoring |
| `POST` | `/api/ratelimit/reset` | Manually restores client quota and clears quarantine | Admin / Demo |
| `GET` | `/api/dfa/state` | Global DFA state, transition table, and PDA stack | Public Monitoring |
| `GET` | `/api/settings` | Current sliding window duration, limits, and IP lists | Admin / Demo |
| `PUT` | `/api/settings` | Updates system limits, sensitivity, and whitelists | Admin / Demo |
| `POST` | `/api/test/request` | Generates a single controlled test probe | Test Harness |
| `POST` | `/api/test/batch` | Runs bounded multi-request attack simulations (max 200) | Test Harness |
| `GET` | `/api/v1/products` | Protected catalog endpoint (subject to rate limits) | Protected API |
| `GET` | `/api/v1/admin/dashboard`| Protected route triggering 403 Suspicious alerts | Protected API |

---

## 7. Verification & Unit Testing

Sentinel includes built-in test suites using Node.js's native test harness:

```bash
# Run backend automata and rate limiting test suites
cd backend
npm test
```

### Test Suite Coverage:
- **DFA Engine Tests (`tests/dfaEngine.test.js`):**
  - Initial state verification ($S_0$).
  - Deterministic state transitions ($S_0 \to S_1 \to S_2 \to S_3$).
  - Cooldown progression ($S_3 \to S_4 \to S_0$).
  - State transition table completeness.
- **Rate Limiter Engine Tests (`tests/rateLimiter.test.js`):**
  - Normal request passage within quota window.
  - Strict HTTP 429 rejection and `Retry-After` header generation upon limit breach.
  - Manual client quota reset validation.

---

## 8. Local Setup & Execution Guide

### Prerequisites
- Node.js v18+ or v20+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/api-rate-limiter-sentinel.git
cd api-rate-limiter-sentinel

# Start the Backend Service
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000

# In a separate terminal, start the Frontend Dashboard
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 9. Production Deployment Guide

### A. Backend Deployment (Render)
1. Link your GitHub repository to Render as a **Web Service**.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CLIENT_ORIGIN`: `https://your-frontend.vercel.app`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/sentinel`

### B. Frontend Deployment (Vercel)
1. Import the repository into Vercel.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Environment Variables:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com`

---

## 10. Academic Curriculum Mapping Matrix

| Subject | Syllabus Topic | Academic Status | Sentinel Implementation Reference |
| :--- | :--- | :---: | :--- |
| **Full Stack** | Component State & Reactive UI | **Implemented** | React.js SPA with real-time SSE stream (`/api/stream/events`) |
| **Full Stack** | Express Middleware Pipelines | **Implemented** | Ordered chaining: Logger $\to$ Regex $\to$ PDA $\to$ DFA $\to$ Limiter |
| **Full Stack** | Database Schema & Indexes | **Implemented** | Mongoose schemas (`ApiLog`, `RateLimitRecord`) with dual fallback |
| **Networks** | OSI vs. TCP/IP Architecture | **Implemented** | Layer 7 HTTP metadata linked with Layer 4 TCP connection state |
| **Networks** | RFC 6585 Status Semantics | **Implemented** | HTTP 429 Too Many Requests, `Retry-After`, `X-RateLimit-*` headers |
| **Networks** | IPv4 & IPv6 Dual Stack | **Implemented** | Dotted-decimal & colon-hex detection with SHA-256 privacy masking |
| **Networks** | TCP Congestion Control | **Theorized & Contrasted** | Explicit comparison between TCP AIMD/cwnd and Layer 7 Token Buckets |
| **Networks** | Quality of Service (QoS) | **Implemented** | IP Whitelist priority tiering bypassing standard consumer throttles |
| **Automata** | Deterministic Finite Automata | **Implemented** | 5-State Machine $M = (Q, \Sigma, \delta, q_0, F)$ with transition table |
| **Automata** | Pushdown Automata (PDA) | **Implemented** | Bounded stack $\Gamma = \{Z_0, \text{OPs}\}$ detecting recursion anomalies |
| **Automata** | Regular Expressions & Grammars| **Implemented** | Chomsky Type-3 lexical filter catching directory traversals (`../`) |

---

## License
MIT License. Created by Vijay V for academic demonstration.
