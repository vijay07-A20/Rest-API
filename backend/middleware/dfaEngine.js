/**
 * Formal Languages and Automata Theory (FLAT): Deterministic Finite Automaton (DFA)
 * 5-Tuple Definition: M = (Q, Sigma, delta, q0, F)
 * 
 * Q = { S0, S1, S2, S3, S4 }
 * Sigma = { NORMAL_REQ, BURST_DETECTED, LIMIT_BREACH, REJECT_ENFORCED, COOLDOWN_TICK, RECOVERY_COMPLETE }
 * q0 = S0
 * F = { S3 } (Quarantined/Limited state) and { S0 } (Stable normal state)
 * delta = State Transition Function
 */

export const DFA_STATES = {
  S0: { id: 'S0', name: 'Normal', description: 'Healthy traffic within standard operational envelope.', color: '#10B981', isAccepting: true },
  S1: { id: 'S1', name: 'Request Frequency Warning', description: 'Elevated request frequency approaching configured threshold.', color: '#F59E0B', isAccepting: false },
  S2: { id: 'S2', name: 'Threshold Exceeded', description: 'Quota ceiling reached; preparing defensive mitigation.', color: '#F97316', isAccepting: false },
  S3: { id: 'S3', name: 'Temporarily Rate Limited', description: 'Defensive containment active: rejecting further requests with HTTP 429.', color: '#EF4444', isAccepting: false },
  S4: { id: 'S4', name: 'Recovery', description: 'Traffic reduced; probation period before restoring to baseline S0.', color: '#3B82F6', isAccepting: true },
};

export const DFA_INPUTS = {
  NORMAL_REQ: 'NORMAL_REQ',
  BURST_DETECTED: 'BURST_DETECTED',
  LIMIT_BREACH: 'LIMIT_BREACH',
  REJECT_ENFORCED: 'REJECT_ENFORCED',
  COOLDOWN_TICK: 'COOLDOWN_TICK',
  RECOVERY_COMPLETE: 'RECOVERY_COMPLETE',
};

// Formal State Transition Table: delta(CurrentState, InputSymbol) -> NextState
export const STATE_TRANSITION_TABLE = {
  S0: {
    NORMAL_REQ: 'S0',
    BURST_DETECTED: 'S1',
    LIMIT_BREACH: 'S2',
    REJECT_ENFORCED: 'S3',
    COOLDOWN_TICK: 'S0',
    RECOVERY_COMPLETE: 'S0',
  },
  S1: {
    NORMAL_REQ: 'S1',
    BURST_DETECTED: 'S2',
    LIMIT_BREACH: 'S2',
    REJECT_ENFORCED: 'S3',
    COOLDOWN_TICK: 'S4',
    RECOVERY_COMPLETE: 'S0',
  },
  S2: {
    NORMAL_REQ: 'S2',
    BURST_DETECTED: 'S3',
    LIMIT_BREACH: 'S3',
    REJECT_ENFORCED: 'S3',
    COOLDOWN_TICK: 'S4',
    RECOVERY_COMPLETE: 'S0',
  },
  S3: {
    NORMAL_REQ: 'S3',
    BURST_DETECTED: 'S3',
    LIMIT_BREACH: 'S3',
    REJECT_ENFORCED: 'S3',
    COOLDOWN_TICK: 'S4',
    RECOVERY_COMPLETE: 'S0',
  },
  S4: {
    NORMAL_REQ: 'S4',
    BURST_DETECTED: 'S1',
    LIMIT_BREACH: 'S2',
    REJECT_ENFORCED: 'S3',
    COOLDOWN_TICK: 'S4',
    RECOVERY_COMPLETE: 'S0',
  },
};

class DfaStateManager {
  constructor() {
    this.clientStates = new Map(); // clientKey -> { currentState, lastTransitionTime, history: [] }
    this.globalCurrentState = 'S0';
    this.globalTransitionHistory = [];
    this.maxHistorySize = 100;
  }

  getClientState(clientKey) {
    if (!this.clientStates.has(clientKey)) {
      this.clientStates.set(clientKey, {
        currentState: 'S0',
        lastTransitionTime: Date.now(),
        history: [],
      });
    }
    return this.clientStates.get(clientKey);
  }

  transition(clientKey, inputSymbol, reason = '') {
    const clientData = this.getClientState(clientKey);
    const prevState = clientData.currentState;
    const nextState = STATE_TRANSITION_TABLE[prevState]?.[inputSymbol] || prevState;

    if (prevState !== nextState) {
      const record = {
        timestamp: new Date().toISOString(),
        clientKey,
        fromState: prevState,
        inputSymbol,
        toState: nextState,
        reason,
      };

      clientData.currentState = nextState;
      clientData.lastTransitionTime = Date.now();
      clientData.history.unshift(record);
      if (clientData.history.length > 20) clientData.history.pop();

      // Update global representation
      this.globalCurrentState = nextState;
      this.globalTransitionHistory.unshift(record);
      if (this.globalTransitionHistory.length > this.maxHistorySize) {
        this.globalTransitionHistory.pop();
      }
    }

    return clientData.currentState;
  }

  evaluateInput(requestCount, maxLimit, isBlocked, isBurst) {
    if (isBlocked) return DFA_INPUTS.REJECT_ENFORCED;
    if (requestCount >= maxLimit) return DFA_INPUTS.LIMIT_BREACH;
    if (isBurst || requestCount >= Math.floor(maxLimit * 0.7)) return DFA_INPUTS.BURST_DETECTED;
    return DFA_INPUTS.NORMAL_REQ;
  }

  getTransitionTableData() {
    return Object.entries(STATE_TRANSITION_TABLE).map(([fromState, transitions]) => ({
      fromState,
      name: DFA_STATES[fromState].name,
      transitions,
    }));
  }

  getStatus() {
    return {
      globalCurrentState: this.globalCurrentState,
      stateMetadata: DFA_STATES[this.globalCurrentState],
      allStates: DFA_STATES,
      transitionTable: this.getTransitionTableData(),
      recentTransitions: this.globalTransitionHistory.slice(0, 25),
      activeClientCount: this.clientStates.size,
    };
  }
}

export const dfaManager = new DfaStateManager();

export function dfaMiddleware(req, res, next) {
  // Attached to request for downstream usage
  req.dfaManager = dfaManager;
  next();
}
