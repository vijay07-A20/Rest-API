import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dfaManager, DFA_INPUTS, DFA_STATES, STATE_TRANSITION_TABLE } from '../middleware/dfaEngine.js';

describe('Deterministic Finite Automaton (DFA) Engine Tests', () => {
  const testClient = 'client_dfa_unit_test';

  beforeEach(() => {
    dfaManager.transition(testClient, DFA_INPUTS.RECOVERY_COMPLETE, 'Test reset');
  });

  test('Initial state is S0 (Normal)', () => {
    const state = dfaManager.getClientState(testClient).currentState;
    assert.equal(state, 'S0', 'Initial state should be S0');
    assert.equal(DFA_STATES[state].name, 'Normal');
  });

  test('Transitions S0 -> S1 on BURST_DETECTED', () => {
    const nextState = dfaManager.transition(testClient, DFA_INPUTS.BURST_DETECTED, 'Burst velocity detected');
    assert.equal(nextState, 'S1', 'State must advance to S1');
    assert.equal(DFA_STATES[nextState].name, 'Request Frequency Warning');
  });

  test('Transitions S1 -> S2 on LIMIT_BREACH', () => {
    dfaManager.transition(testClient, DFA_INPUTS.BURST_DETECTED);
    const nextState = dfaManager.transition(testClient, DFA_INPUTS.LIMIT_BREACH, 'Quota ceiling touched');
    assert.equal(nextState, 'S2', 'State must advance to S2');
    assert.equal(DFA_STATES[nextState].name, 'Threshold Exceeded');
  });

  test('Transitions S2 -> S3 on REJECT_ENFORCED', () => {
    dfaManager.transition(testClient, DFA_INPUTS.BURST_DETECTED);
    dfaManager.transition(testClient, DFA_INPUTS.LIMIT_BREACH);
    const nextState = dfaManager.transition(testClient, DFA_INPUTS.REJECT_ENFORCED, 'HTTP 429 triggered');
    assert.equal(nextState, 'S3', 'State must advance to S3');
    assert.equal(DFA_STATES[nextState].name, 'Temporarily Rate Limited');
  });

  test('Transitions S3 -> S4 on COOLDOWN_TICK and S4 -> S0 on RECOVERY_COMPLETE', () => {
    // Force into S3
    dfaManager.transition(testClient, DFA_INPUTS.REJECT_ENFORCED);
    assert.equal(dfaManager.getClientState(testClient).currentState, 'S3');

    // Cooldown tick moves to S4
    const s4State = dfaManager.transition(testClient, DFA_INPUTS.COOLDOWN_TICK, 'Client activity quiet');
    assert.equal(s4State, 'S4', 'State must advance to S4 (Recovery)');

    // Recovery complete moves back to S0
    const s0State = dfaManager.transition(testClient, DFA_INPUTS.RECOVERY_COMPLETE, 'Probation period cleared');
    assert.equal(s0State, 'S0', 'State must return to baseline S0 (Normal)');
  });

  test('State Transition Table is fully defined and deterministic', () => {
    const states = ['S0', 'S1', 'S2', 'S3', 'S4'];
    const alphabet = Object.values(DFA_INPUTS);

    for (const s of states) {
      assert.ok(STATE_TRANSITION_TABLE[s], `State ${s} must exist in transition table`);
      for (const symbol of alphabet) {
        const dest = STATE_TRANSITION_TABLE[s][symbol];
        assert.ok(states.includes(dest), `Transition delta(${s}, ${symbol}) -> ${dest} must be a valid state`);
      }
    }
  });
});
