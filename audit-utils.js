const crypto = require('crypto');
const net = require('net');

function normalizeMaybeIpV4Mapped(ip) {
  if (typeof ip !== 'string') return '';
  const trimmed = ip.trim();
  if (trimmed.toLowerCase().startsWith('::ffff:')) {
    return trimmed.slice('::ffff:'.length);
  }
  return trimmed;
}

function maskIpAddress(ipRaw) {
  const ip = normalizeMaybeIpV4Mapped(ipRaw);
  const family = net.isIP(ip);
  if (!family) return null;

  if (family === 4) {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  // IPv6: keep first 3 hextets (48 bits), zero the rest.
  const lower = ip.toLowerCase();
  const [left, right] = lower.split('::');
  const leftParts = left ? left.split(':').filter(Boolean) : [];
  const rightParts = right ? right.split(':').filter(Boolean) : [];
  const missing = 8 - (leftParts.length + rightParts.length);
  if (missing < 0) return null;
  const full = [...leftParts, ...Array(missing).fill('0'), ...rightParts]
    .map((p) => (p === '' ? '0' : p));
  if (full.length !== 8) return null;

  const masked = [full[0], full[1], full[2], '0', '0', '0', '0', '0'];
  return masked.join(':');
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function sanitizeAuditDetails(value, depth = 0) {
  if (depth > 6) return '[truncated]';
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (value.length > 1000) return value.slice(0, 1000) + '…[truncated]';
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((v) => sanitizeAuditDetails(v, depth + 1));

  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const key = String(k).toLowerCase();
      if (
        key.includes('password') ||
        key.includes('passphrase') ||
        key.includes('token') ||
        key.includes('authorization') ||
        key.includes('cookie') ||
        key.includes('email') ||
        key.includes('phone') ||
        key.includes('firstname') ||
        key.includes('lastname') ||
        key.includes('birth') ||
        key.includes('address') ||
        key.includes('patient')
      ) {
        out[k] = '[redacted]';
        continue;
      }
      out[k] = sanitizeAuditDetails(v, depth + 1);
    }
    return out;
  }

  return '[unsupported]';
}

module.exports = {
  normalizeMaybeIpV4Mapped,
  maskIpAddress,
  sha256Hex,
  sanitizeAuditDetails
};
