import { dfaManager } from '../middleware/dfaEngine.js';
import { pdaMonitor } from '../middleware/pdaSequenceMonitor.js';
import { extractClientIp } from '../utils/ipUtils.js';
import { successResponse } from '../utils/responseFormatter.js';

export function getDfaState(req, res) {
  const dfaStatus = dfaManager.getStatus();
  const clientIp = extractClientIp(req);
  const pdaReport = pdaMonitor.getStackReport(clientIp);

  return successResponse(res, {
    ...dfaStatus,
    pushdownAutomataContext: pdaReport,
    formalModel: {
      automatonType: 'Deterministic Finite Automaton (DFA)',
      tupleNotation: 'M = (Q, Sigma, delta, q0, F)',
      statesCount: 5,
      alphabetCount: 6,
    },
  }, 'DFA State Machine metadata and history retrieved');
}
