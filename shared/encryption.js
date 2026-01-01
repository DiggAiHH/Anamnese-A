/*
 * Shared encryption helpers for Web + Mobile
 * AES-256-GCM + PBKDF2 (600k iterations) - environment agnostic
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SharedEncryption = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
'use strict';

const PBKDF2_ITERATIONS = 600000;

const WEAK_PASSWORD_BLACKLIST = [
  'password','123456','12345678','qwerty','abc123','monkey','1234567',
  'letmein','trustno1','dragon','baseball','iloveyou','master','sunshine',
  'ashley','bailey','passw0rd','shadow','123123','654321','superman',
  'qazwsx','michael','football','welcome','jesus','ninja','mustang'
];

let customCryptoProvider = null;

function getCrypto() {
  if (customCryptoProvider) {
    return customCryptoProvider;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  try {
    // eslint-disable-next-line global-require
    const { webcrypto } = require('crypto');
    if (webcrypto && webcrypto.subtle) {
      return webcrypto;
    }
  } catch (error) {
    // ignore – fallback handled below
  }
  throw new Error('No WebCrypto implementation available');
}

function setCryptoProvider(provider) {
  customCryptoProvider = provider;
}

function ensureBuffer(input) {
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

function toBase64(uintArray) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(uintArray).toString('base64');
  }
  let str = '';
  uintArray.forEach(b => {
    str += String.fromCharCode(b);
  });
  return btoa(str);
}

function fromBase64(base64) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length < 16) errors.push('Password must be at least 16 characters long');
  if (password && password.length > 128) errors.push('Password must not exceed 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one digit');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character');
  const lower = (password || '').toLowerCase();
  if (WEAK_PASSWORD_BLACKLIST.some(pattern => lower.includes(pattern))) {
    errors.push('Password contains common weak patterns');
  }
  return { valid: errors.length === 0, errors };
}

async function deriveKey(password, salt, cryptoImpl = getCrypto()) {
  const encoder = new TextEncoder();
  const passwordKey = await cryptoImpl.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return cryptoImpl.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(plaintext, password, options = {}) {
  const { skipValidation = false, cryptoImpl = getCrypto() } = options;
  if (!skipValidation) {
    const result = validatePasswordStrength(password);
    if (!result.valid) {
      throw new Error(result.errors.join('; '));
    }
  }
  const encoder = new TextEncoder();
  const salt = cryptoImpl.getRandomValues(new Uint8Array(16));
  const iv = cryptoImpl.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, cryptoImpl);
  const encrypted = await cryptoImpl.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
  const cipherBuffer = new Uint8Array(encrypted);
  const payload = new Uint8Array(salt.length + iv.length + cipherBuffer.length);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(cipherBuffer, salt.length + iv.length);
  return toBase64(payload);
}

async function decryptData(encryptedBase64, password, options = {}) {
  const { cryptoImpl = getCrypto() } = options;
  if (!encryptedBase64 || typeof encryptedBase64 !== 'string') {
    throw new Error('Invalid encrypted payload');
  }
  const payload = ensureBuffer(fromBase64(encryptedBase64));
  if (payload.length < 44) {
    throw new Error('Encrypted payload too short');
  }
  const salt = payload.slice(0, 16);
  const iv = payload.slice(16, 28);
  const cipher = payload.slice(28);
  const key = await deriveKey(password, salt, cryptoImpl);
  const decrypted = await cryptoImpl.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

return {
  validatePasswordStrength,
  deriveKey,
  encryptData,
  decryptData,
  setCryptoProvider,
  PBKDF2_ITERATIONS
};

}));
