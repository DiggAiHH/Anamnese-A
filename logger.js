const winston = require('winston');

const SENSITIVE_KEYS = new Set([
  'password',
  'passphrase',
  'code',
  'token',
  'authorization',
  'cookie',
  'set-cookie',
  'handoffpayload',
  'privatepayload',
  'master_key',
  'masterkey',
  'jwt_secret',
  'jwtsecret',
  'stripe_secret_key',
  'stripe_webhook_secret'
]);

function looksLikeEmail(value) {
  if (typeof value !== 'string') return false;
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
}

function redactAny(value, depth = 0, seen = new WeakSet()) {
  if (depth > 6) return '[redacted]';
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (looksLikeEmail(value)) return '[redacted-email]';
    if (value.length > 2000) return value.slice(0, 2000) + '…[truncated]';
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.map((v) => redactAny(v, depth + 1, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) return '[circular]';
    seen.add(value);

    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const key = String(k).toLowerCase();
      if (SENSITIVE_KEYS.has(key)) {
        out[k] = '[redacted]';
        continue;
      }
      out[k] = redactAny(v, depth + 1, seen);
    }
    return out;
  }

  return '[redacted]';
}

const redactFormat = winston.format((info) => {
  try {
    return redactAny(info);
  } catch {
    return info;
  }
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    redactFormat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        redactFormat(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
