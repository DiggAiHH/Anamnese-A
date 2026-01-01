/**
 * Anamnese Dual-Codec (vollständig, schema-unabhängig)
 *
 * Ziel:
 * - ALLE Fragen abdecken (inkl. späterer Erweiterungen), ohne fixes ID-Mapping.
 * - Freitext/PII NICHT im Klartext im Kurzcode.
 * - Stattdessen: Freitext/PII wird tokenisiert und im verschlüsselten Payload abgelegt.
 * - Statische Antworten werden als kompakte binäre Records kodiert.
 *
 * Output:
 * - staticCode: Base62 (nur Buchstaben+Ziffern), möglichst kurz (optional deflate-raw)
 * - privatePayload: AES-256-GCM verschlüsseltes JSON (base64url)
 *
 * Hinweis:
 * - Ein fixer 7/8-stelliger Code für „alles“ ist bei diesem Fragebogen nicht realistisch.
 * - „Minimal wie möglich“: Record-Stream + optionale Deflate-Kompression.
 */

'use strict';

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const ANSWER_TYPE = {
  SELECT_INDEX: 1,
  MULTI_INDEX_LIST: 2,
  NUMBER_U32: 3,
  TEXT_REF: 4
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function utf8Encode(s) {
  return new TextEncoder().encode(String(s));
}

function utf8Decode(bytes) {
  return new TextDecoder().decode(bytes);
}

function concatBytes(...parts) {
  const len = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

// LEB128 unsigned varint
function encodeVarint(n) {
  assert(Number.isInteger(n) && n >= 0, 'Varint erwartet Integer >= 0');
  const out = [];
  let x = n >>> 0;
  while (x >= 0x80) {
    out.push((x & 0x7f) | 0x80);
    x >>>= 7;
  }
  out.push(x);
  return new Uint8Array(out);
}

function decodeVarint(bytes, offset) {
  let x = 0;
  let shift = 0;
  let i = offset;
  while (i < bytes.length) {
    const b = bytes[i++];
    x |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) return { value: x >>> 0, nextOffset: i };
    shift += 7;
    if (shift > 35) throw new Error('Varint zu lang/korrupt');
  }
  throw new Error('Varint endet unerwartet');
}

function base64UrlEncode(bytes) {
  let b64;
  if (typeof Buffer !== 'undefined') {
    b64 = Buffer.from(bytes).toString('base64');
  } else {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    // btoa erwartet Latin1 / binary string
    b64 = btoa(binary);
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(str) {
  const padLen = (4 - (str.length % 4)) % 4;
  const padded = str + '='.repeat(padLen);
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

// Base62 (byte-array-safe, inkl. führender 0-bytes)
function bytesToBase62(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('bytesToBase62 erwartet Uint8Array');

  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) leadingZeros++;

  let value = 0n;
  for (let i = leadingZeros; i < bytes.length; i++) {
    value = (value << 8n) + BigInt(bytes[i]);
  }

  let out = '';
  if (value !== 0n) {
    while (value > 0n) {
      const r = Number(value % 62n);
      out = BASE62_ALPHABET[r] + out;
      value /= 62n;
    }
  }

  if (leadingZeros === bytes.length) return '0';
  return '0'.repeat(leadingZeros) + (out.length ? out : '0');
}

function base62ToBytes(str) {
  assert(typeof str === 'string' && str.length > 0, 'base62ToBytes erwartet string');

  let leadingZeros = 0;
  while (leadingZeros < str.length && str[leadingZeros] === '0') leadingZeros++;

  const rest = str.slice(leadingZeros);
  let value = 0n;
  if (rest.length && !(rest.length === 1 && rest[0] === '0')) {
    for (const ch of rest) {
      const idx = BASE62_ALPHABET.indexOf(ch);
      if (idx < 0) throw new Error(`Ungültiges Base62-Zeichen: '${ch}'`);
      value = value * 62n + BigInt(idx);
    }
  }

  const bytes = [];
  while (value > 0n) {
    bytes.push(Number(value & 0xffn));
    value >>= 8n;
  }
  bytes.reverse();

  return concatBytes(new Uint8Array(leadingZeros), new Uint8Array(bytes));
}

async function compressBytes(bytes) {
  try {
    // eslint-disable-next-line global-require
    const zlib = require('zlib');
    const compressed = zlib.deflateRawSync(Buffer.from(bytes), { level: 9 });
    return new Uint8Array(compressed);
  } catch {
    if (typeof CompressionStream !== 'undefined') {
      const cs = new CompressionStream('deflate-raw');
      const blob = new Blob([bytes]).stream().pipeThrough(cs);
      return new Uint8Array(await new Response(blob).arrayBuffer());
    }
  }
  return bytes;
}

async function decompressBytes(bytes) {
  try {
    // eslint-disable-next-line global-require
    const zlib = require('zlib');
    const inflated = zlib.inflateRawSync(Buffer.from(bytes));
    return new Uint8Array(inflated);
  } catch {
    if (typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const blob = new Blob([bytes]).stream().pipeThrough(ds);
      return new Uint8Array(await new Response(blob).arrayBuffer());
    }
  }
  return bytes;
}

async function ensureWebCrypto() {
  if (!globalThis.crypto) {
    try {
      // eslint-disable-next-line global-require
      globalThis.crypto = require('crypto').webcrypto;
    } catch {
      // ignore
    }
  }
  const c = globalThis.crypto;
  if (!c || !c.subtle) throw new Error('WebCrypto nicht verfügbar (crypto.subtle)');
  return c;
}

async function deriveKeyFromPassphrase(passphrase, salt) {
  const crypto = await ensureWebCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    utf8Encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function getRandomBytes(byteLen) {
  if (globalThis.crypto && globalThis.crypto.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint8Array(byteLen));
  }
  // eslint-disable-next-line global-require
  return new Uint8Array(require('crypto').randomBytes(byteLen));
}

function randomPassphraseBase62(byteLen = 32) {
  return bytesToBase62(getRandomBytes(byteLen));
}

function randomPassphraseBase62Chars(charLen = 12) {
  assert(Number.isInteger(charLen) && charLen >= 10, 'Passphrase-Länge min. 10 Zeichen');
  const bytes = getRandomBytes(charLen);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += BASE62_ALPHABET[bytes[i] % 62];
  }
  return out;
}

async function encryptPrivatePayload(privateObj, passphrase) {
  const crypto = await ensureWebCrypto();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const plaintext = utf8Encode(JSON.stringify(privateObj));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  );

  return `v1.${base64UrlEncode(salt)}.${base64UrlEncode(iv)}.${base64UrlEncode(ciphertext)}`;
}

async function decryptPrivatePayload(payload, passphrase) {
  const crypto = await ensureWebCrypto();
  const parts = String(payload).split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('Ungültiges privatePayload Format');

  const salt = base64UrlDecode(parts[1]);
  const iv = base64UrlDecode(parts[2]);
  const ciphertext = base64UrlDecode(parts[3]);

  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const plaintext = new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  );
  return JSON.parse(utf8Decode(plaintext));
}

function encodeRecord(questionId, type, payloadBytes) {
  const idBytes = utf8Encode(questionId);
  return concatBytes(
    encodeVarint(idBytes.length),
    idBytes,
    encodeVarint(type),
    encodeVarint(payloadBytes.length),
    payloadBytes
  );
}

function decodeRecords(bytes) {
  const out = {};
  let offset = 0;

  while (offset < bytes.length) {
    const idLen = decodeVarint(bytes, offset);
    offset = idLen.nextOffset;

    const idBytes = bytes.slice(offset, offset + idLen.value);
    offset += idLen.value;
    const questionId = utf8Decode(idBytes);

    const t = decodeVarint(bytes, offset);
    offset = t.nextOffset;

    const len = decodeVarint(bytes, offset);
    offset = len.nextOffset;

    const payload = bytes.slice(offset, offset + len.value);
    offset += len.value;

    if (t.value === ANSWER_TYPE.SELECT_INDEX || t.value === ANSWER_TYPE.NUMBER_U32 || t.value === ANSWER_TYPE.TEXT_REF) {
      const v = decodeVarint(payload, 0);
      out[questionId] = { type: t.value, value: v.value };
      continue;
    }

    if (t.value === ANSWER_TYPE.MULTI_INDEX_LIST) {
      let pOff = 0;
      const count = decodeVarint(payload, pOff);
      pOff = count.nextOffset;
      const indices = [];
      for (let i = 0; i < count.value; i++) {
        const v = decodeVarint(payload, pOff);
        pOff = v.nextOffset;
        indices.push(v.value);
      }
      out[questionId] = { type: t.value, indices };
      continue;
    }

    throw new Error(`Unbekannter answerType beim Decode: ${t.value}`);
  }

  return out;
}

function anonymizeAnswers(answers, options) {
  const privateKinds = options?.privateKinds || new Set(['text', 'pii', 'date']);
  const texts = [];
  const staticAnswers = {};

  for (const [questionId, rec] of Object.entries(answers)) {
    if (!rec || typeof rec !== 'object') continue;

    if (rec.kind === 'select') {
      staticAnswers[questionId] = { type: ANSWER_TYPE.SELECT_INDEX, value: rec.index >>> 0 };
      continue;
    }

    if (rec.kind === 'multi') {
      const indices = Array.isArray(rec.indices) ? rec.indices.map((n) => (n >>> 0)) : [];
      staticAnswers[questionId] = { type: ANSWER_TYPE.MULTI_INDEX_LIST, indices };

      const freeText = rec.freeText ? String(rec.freeText) : '';
      if (freeText.trim()) {
        const freeId = `${questionId}::__free`;
        const tokenId = texts.length;
        texts.push({ questionId: freeId, mode: 'multiFreeText', text: freeText });
        staticAnswers[freeId] = { type: ANSWER_TYPE.TEXT_REF, value: tokenId };
      }
      continue;
    }

    if (rec.kind === 'number') {
      if (privateKinds.has('number')) {
        const tokenId = texts.length;
        texts.push({ questionId, mode: 'number', text: String(rec.value) });
        staticAnswers[questionId] = { type: ANSWER_TYPE.TEXT_REF, value: tokenId };
      } else {
        staticAnswers[questionId] = { type: ANSWER_TYPE.NUMBER_U32, value: (rec.value >>> 0) };
      }
      continue;
    }

    if (privateKinds.has(rec.kind) || rec.kind === 'text') {
      const tokenId = texts.length;
      texts.push({ questionId, mode: rec.kind || 'text', text: String(rec.text ?? rec.value ?? '') });
      staticAnswers[questionId] = { type: ANSWER_TYPE.TEXT_REF, value: tokenId };
      continue;
    }

    throw new Error(`Unbekannter record.kind: ${rec.kind} (Frage ${questionId})`);
  }

  return { staticAnswers, privateObj: { texts } };
}

async function encodeDual(answers, passphrase, options) {
  assert(answers && typeof answers === 'object', 'answers muss Objekt sein');
  await ensureWebCrypto();

  const opts = { compress: true, passphraseLength: 12, ...options };
  const usedPassphrase = passphrase || randomPassphraseBase62Chars(opts.passphraseLength);
  assert(typeof usedPassphrase === 'string' && usedPassphrase.length >= 12, 'Passphrase min. 12 Zeichen');
  const { staticAnswers, privateObj } = anonymizeAnswers(answers, opts);

  const entries = Object.entries(staticAnswers).sort(([a], [b]) => a.localeCompare(b));
  const records = [];

  for (const [questionId, rec] of entries) {
    if (rec.type === ANSWER_TYPE.SELECT_INDEX || rec.type === ANSWER_TYPE.NUMBER_U32 || rec.type === ANSWER_TYPE.TEXT_REF) {
      records.push(encodeRecord(questionId, rec.type, encodeVarint(rec.value)));
      continue;
    }

    if (rec.type === ANSWER_TYPE.MULTI_INDEX_LIST) {
      const indices = Array.isArray(rec.indices) ? rec.indices : [];
      const payloadParts = [encodeVarint(indices.length)];
      for (const idx of indices) payloadParts.push(encodeVarint(idx >>> 0));
      records.push(encodeRecord(questionId, rec.type, concatBytes(...payloadParts)));
      continue;
    }

    throw new Error(`Unbekannter static rec.type: ${rec.type}`);
  }

  const rawStaticBytes = concatBytes(...records);
  const staticBytes = opts.compress ? await compressBytes(rawStaticBytes) : rawStaticBytes;
  const staticCode = bytesToBase62(staticBytes);
  const privatePayload = await encryptPrivatePayload(privateObj, usedPassphrase);

  return { staticCode, privatePayload, passphrase: usedPassphrase };
}

async function decodeDual(staticCode, privatePayload, passphrase, options) {
  assert(typeof staticCode === 'string' && staticCode.length > 0, 'staticCode fehlt');
  assert(typeof privatePayload === 'string' && privatePayload.length > 0, 'privatePayload fehlt');
  assert(typeof passphrase === 'string' && passphrase.length >= 12, 'Passphrase min. 12 Zeichen');

  const opts = { compress: true, ...options };
  const staticDecoded = await decodeStatic(staticCode, opts);
  const privateObj = await decodePrivate(privatePayload, passphrase);
  const answers = rehydrateTextRefs(staticDecoded.answers, privateObj);
  return { answers, private: privateObj };
}

async function decodeStatic(staticCode, options) {
  assert(typeof staticCode === 'string' && staticCode.length > 0, 'staticCode fehlt');
  const opts = { compress: true, ...options };
  const compressedBytes = base62ToBytes(staticCode);
  const rawBytes = opts.compress ? await decompressBytes(compressedBytes) : compressedBytes;
  const decoded = decodeRecords(rawBytes);

  const answers = {};
  for (const [questionId, rec] of Object.entries(decoded)) {
    if (rec.type === ANSWER_TYPE.TEXT_REF) {
      answers[questionId] = { kind: 'textRef', tokenId: rec.value };
      continue;
    }
    if (rec.type === ANSWER_TYPE.SELECT_INDEX) {
      answers[questionId] = { kind: 'select', index: rec.value };
      continue;
    }
    if (rec.type === ANSWER_TYPE.NUMBER_U32) {
      answers[questionId] = { kind: 'number', value: rec.value };
      continue;
    }
    if (rec.type === ANSWER_TYPE.MULTI_INDEX_LIST) {
      answers[questionId] = { kind: 'multi', indices: rec.indices };
      continue;
    }
    answers[questionId] = { kind: 'unknown', raw: rec };
  }

  return { answers };
}

async function decodePrivate(privatePayload, passphrase) {
  assert(typeof privatePayload === 'string' && privatePayload.length > 0, 'privatePayload fehlt');
  assert(typeof passphrase === 'string' && passphrase.length >= 12, 'Passphrase min. 12 Zeichen');
  return decryptPrivatePayload(privatePayload, passphrase);
}

function rehydrateTextRefs(staticAnswers, privateObj) {
  const answers = { ...staticAnswers };

  // TEXT_REF -> text
  for (const [questionId, rec] of Object.entries(answers)) {
    if (!rec || rec.kind !== 'textRef') continue;
    const t = privateObj?.texts?.[rec.tokenId];
    answers[questionId] = {
      kind: 'text',
      text: (t && t.questionId === questionId) ? t.text : ''
    };
  }

  // Multi-FreeText Konvention zusammenführen
  for (const [questionId, rec] of Object.entries(answers)) {
    if (!questionId.endsWith('::__free')) continue;
    const baseId = questionId.slice(0, -'::__free'.length);
    if (answers[baseId] && answers[baseId].kind === 'multi') {
      answers[baseId].freeText = rec.text;
    }
    delete answers[questionId];
  }

  return answers;
}

async function runSelfTest() {
  await ensureWebCrypto();
  const passphrase = randomPassphraseBase62(32);
  const answers = {
    '0002': { kind: 'select', index: 1 },
    '1000': { kind: 'select', index: 1 },
    '1005': { kind: 'multi', indices: [0, 2, 4], freeText: 'andere Auffälligkeit: starkes Frieren' },
    '3003': { kind: 'pii', text: 'name@example.com' },
    '3004': { kind: 'pii', text: '+49 170 1234567' },
    '4001': { kind: 'number', value: 83 },
    '9900': { kind: 'select', index: 4 }
  };

  const encoded = await encodeDual(answers, passphrase, { compress: true, privateKinds: new Set(['text', 'pii', 'date']) });
  const decoded = await decodeDual(encoded.staticCode, encoded.privatePayload, passphrase, { compress: true });

  // eslint-disable-next-line no-console
  console.warn('selftest staticCode.length:', encoded.staticCode.length);
  // eslint-disable-next-line no-console
  console.warn('selftest privatePayload.length:', encoded.privatePayload.length);
  // Keine decoded Inhalte loggen (PII-Risiko). Nur Status.
  // eslint-disable-next-line no-console
  console.warn('selftest decode ok:', Boolean(decoded && decoded.answers));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    encodeDual,
    decodeDual,
    decodeStatic,
    decodePrivate,
    encryptPrivatePayload,
    decryptPrivatePayload,
    randomPassphraseBase62,
    randomPassphraseBase62Chars,
    ANSWER_TYPE
  };
}

const _maybeWindow = (typeof globalThis !== 'undefined' && globalThis.window) ? globalThis.window : null;

if (_maybeWindow) {
  _maybeWindow.AnamneseCodec = {
    encodeDual,
    decodeDual,
    decodeStatic,
    decodePrivate,
    encryptPrivatePayload,
    decryptPrivatePayload,
    randomPassphraseBase62,
    randomPassphraseBase62Chars,
    ANSWER_TYPE
  };
}

if (typeof require !== 'undefined' && require.main === module) {
  runSelfTest().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  });
}
