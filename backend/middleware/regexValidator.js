/**
 * Formal Languages and Automata Theory (FLAT): Regular Grammar & Regex Validator
 * Uses formal regular expressions to enforce strict syntactic grammars on:
 * - HTTP Methods (Grammar: M -> GET | POST | PUT | DELETE | PATCH | OPTIONS | HEAD)
 * - URI Path structure
 * - Request IDs and UUID patterns
 * - Query parameter safety (detecting path traversal, SQLi, and script injection)
 */

export const GRAMMAR_PATTERNS = {
  // Formal grammar for supported HTTP methods
  httpMethod: /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$/,

  // Strict API route format: starts with /api/, followed by alphanumeric segments separated by slashes or hyphens
  endpointFormat: /^\/api(\/[a-zA-Z0-9_\-]+)*\/?$/,

  // Request ID grammar: RFC 4122 UUID or alphanumeric token between 8 and 64 characters
  requestId: /^(?:[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}|req_[a-zA-Z0-9]{12,32})$/,

  // Malicious attack patterns (Regular expressions for lexical syntax anomalies)
  pathTraversal: /(?:\.\.\/|\.\.\\)/i,
  sqlInjection: /(?:'|\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|OR\s+1=1|--)\b)/i,
  crossSiteScripting: /(?:<script|\bjavascript:|\bonerror=|\bonload=)/i,
};

export function regexValidator(req, res, next) {
  const method = req.method;
  const path = req.path;
  const rawUrl = req.originalUrl || req.url;

  // 1. Validate HTTP Method
  if (!GRAMMAR_PATTERNS.httpMethod.test(method)) {
    return res.status(405).json({
      success: false,
      message: 'RFC 7231 Non-compliant HTTP Method: Rejected by Regular Grammar Validator',
      error: `Method '${method}' violates allowed method grammar.`,
      classification: 'Suspicious',
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // 2. Validate Endpoint Grammar
  if (!GRAMMAR_PATTERNS.endpointFormat.test(path)) {
    return res.status(400).json({
      success: false,
      message: 'Syntactically Malformed API Endpoint Format',
      error: `Endpoint '${path}' violates valid URI path grammar.`,
      classification: 'Suspicious',
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // 3. Security Lexical Analysis on Query Strings and Raw URL
  if (GRAMMAR_PATTERNS.pathTraversal.test(rawUrl)) {
    req.regexViolation = 'PATH_TRAVERSAL_DETECTED';
    return res.status(400).json({
      success: false,
      message: 'Security Grammar Breach: Path Traversal Detected (..)',
      error: 'Directory traversal sequence rejected by automata filter.',
      classification: 'Suspicious',
      meta: { timestamp: new Date().toISOString() },
    });
  }

  if (GRAMMAR_PATTERNS.sqlInjection.test(rawUrl)) {
    req.regexViolation = 'SQLI_PATTERN_DETECTED';
    return res.status(400).json({
      success: false,
      message: 'Security Grammar Breach: SQL Injection Signature Detected',
      error: 'Query parameter pattern matches SQL injection lexical signature.',
      classification: 'Suspicious',
      meta: { timestamp: new Date().toISOString() },
    });
  }

  if (GRAMMAR_PATTERNS.crossSiteScripting.test(rawUrl)) {
    req.regexViolation = 'XSS_PATTERN_DETECTED';
    return res.status(400).json({
      success: false,
      message: 'Security Grammar Breach: Cross-Site Scripting (XSS) Signature Detected',
      error: 'Payload matches forbidden HTML/Script tag grammar.',
      classification: 'Suspicious',
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // Assign valid request ID if missing or validate header
  const clientReqId = req.headers['x-request-id'];
  if (clientReqId && !GRAMMAR_PATTERNS.requestId.test(clientReqId)) {
    // Malformed request ID from client, sanitize by generating fresh one
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } else {
    req.requestId = clientReqId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  res.setHeader('X-Request-ID', req.requestId);
  next();
}
