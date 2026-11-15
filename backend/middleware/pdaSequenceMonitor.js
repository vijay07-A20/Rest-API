/**
 * Formal Languages and Automata Theory (FLAT): Pushdown Automaton (PDA) Sequence Monitor
 * 
 * Formal Definition: M_pda = (Q, Sigma, Gamma, delta, q0, z0, F)
 * Where:
 * - Gamma: Stack alphabet representing API interaction states:
 *   [Z0 (Stack Bottom), AUTH_REQ, READ_OP, WRITE_OP, ERROR_TRIP, RECURSIVE_PROBE]
 * - Stack Z: Bounded LIFO storage tracking client interaction sequences.
 * 
 * Connection to Context-Free Grammars (CFG):
 * Legitimate client sessions follow balanced grammar rules:
 *   S -> Init A Complete | eps
 *   A -> Read A | Write A | eps
 * Attackers and fuzzers produce unbalanced or pathologically recursive sequences
 * that exhaust stack bounds or fail matching reduction rules.
 */

import { extractClientIp } from '../utils/ipUtils.js';

class PushdownAutomatonMonitor {
  constructor() {
    this.clientStacks = new Map(); // clientKey -> { stack: ['Z0'], maxDepth: 12, violations: 0 }
    this.maxSafeStackDepth = 12;
  }

  getClientStack(clientKey) {
    if (!this.clientStacks.has(clientKey)) {
      this.clientStacks.set(clientKey, {
        stack: ['Z0'], // Z0 is the initial stack bottom symbol
        history: [],
        anomalies: 0,
      });
    }
    return this.clientStacks.get(clientKey);
  }

  processSequence(req, res) {
    const clientKey = extractClientIp(req);
    const clientData = this.getClientStack(clientKey);
    const path = req.path || '';
    const method = req.method;

    let operationSymbol = 'READ_OP';
    let stackAction = 'PUSH';

    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      operationSymbol = 'WRITE_OP';
    } else if (path.includes('login') || path.includes('auth')) {
      operationSymbol = 'AUTH_REQ';
    } else if (path.includes('admin') || path.includes('system') || path.includes('restricted')) {
      operationSymbol = 'PRIVILEGED_PROBE';
    }

    // PDA Transition Logic:
    // If client makes legitimate completion or read, allow matching pop
    if (operationSymbol === 'READ_OP' && clientData.stack.length > 1) {
      const top = clientData.stack[clientData.stack.length - 1];
      if (top === 'WRITE_OP' || top === 'READ_OP') {
        clientData.stack.pop();
        stackAction = 'POP';
      } else {
        clientData.stack.push(operationSymbol);
        stackAction = 'PUSH';
      }
    } else {
      clientData.stack.push(operationSymbol);
      stackAction = 'PUSH';
    }

    // Inspect stack depth bounds
    let isStackAnomaly = false;
    let anomalyReason = null;

    if (clientData.stack.length > this.maxSafeStackDepth) {
      isStackAnomaly = true;
      anomalyReason = `PDA Stack Overflow: Unbalanced sequence depth (${clientData.stack.length} > ${this.maxSafeStackDepth})`;
      clientData.anomalies += 1;
      // Reset stack to bottom symbol to prevent unbounded memory growth
      clientData.stack = ['Z0'];
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      operationSymbol,
      stackAction,
      stackDepth: clientData.stack.length,
      currentStackTop: clientData.stack[clientData.stack.length - 1],
      isStackAnomaly,
      anomalyReason,
    };

    clientData.history.unshift(logEntry);
    if (clientData.history.length > 20) clientData.history.pop();

    req.pdaContext = {
      stackDepth: clientData.stack.length,
      stackTop: clientData.stack[clientData.stack.length - 1],
      isAnomaly: isStackAnomaly,
      anomalyReason,
    };

    return req.pdaContext;
  }

  getStackReport(clientKey) {
    const data = this.getClientStack(clientKey);
    return {
      clientKey,
      currentStack: [...data.stack],
      stackDepth: data.stack.length,
      maxSafeDepth: this.maxSafeStackDepth,
      totalAnomalies: data.anomalies,
      recentOperations: data.history.slice(0, 10),
    };
  }
}

export const pdaMonitor = new PushdownAutomatonMonitor();

export function pdaMiddleware(req, res, next) {
  pdaMonitor.processSequence(req, res);
  next();
}
