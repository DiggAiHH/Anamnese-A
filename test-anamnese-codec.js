'use strict';

const assert = require('assert');
const {
  encodeDual,
  decodeDual,
  decodeStatic
} = require('./anamnese-codec');

(async () => {
  // Roundtrip: fixed + multi + freeText + pii + date + number
  const input = {
    '0002': { kind: 'select', index: 1 },
    '1A00': { kind: 'multi', indices: [0, 2, 4], freeText: 'andere: starkes Frieren' },
    '4001': { kind: 'number', value: 83 },
    '0003': { kind: 'date', text: '1980-01-02' },
    '0000': { kind: 'pii', text: 'Mustermann' },
    '0001': { kind: 'pii', text: 'Max' },
    'email': { kind: 'pii', text: 'max@example.com' },
    'free': { kind: 'text', text: 'Freitext XYZ' }
  };

  const encoded = await encodeDual(input, undefined, {
    compress: true,
    privateKinds: new Set(['text', 'pii', 'date'])
  });

  assert.ok(typeof encoded.staticCode === 'string' && encoded.staticCode.length > 0, 'staticCode fehlt');
  assert.ok(typeof encoded.privatePayload === 'string' && encoded.privatePayload.startsWith('v1.'), 'privatePayload Format');
  assert.ok(typeof encoded.passphrase === 'string' && encoded.passphrase.length >= 12, 'passphrase zu kurz');

  // Static decode must not expose PII/text/date
  const staticDecoded = await decodeStatic(encoded.staticCode, { compress: true });
  assert.strictEqual(staticDecoded.answers['0000'].kind, 'textRef', 'PII darf nicht im staticCode sein');
  assert.strictEqual(staticDecoded.answers['email'].kind, 'textRef', 'PII darf nicht im staticCode sein');
  assert.strictEqual(staticDecoded.answers['free'].kind, 'textRef', 'Freitext darf nicht im staticCode sein');
  assert.strictEqual(staticDecoded.answers['0003'].kind, 'textRef', 'Datum darf nicht im staticCode sein');

  // Number should be static (not private) in this config
  assert.strictEqual(staticDecoded.answers['4001'].kind, 'number', 'Number sollte statisch kodiert sein');
  assert.strictEqual(staticDecoded.answers['4001'].value, 83);

  // Full decode restores content
  const fullDecoded = await decodeDual(encoded.staticCode, encoded.privatePayload, encoded.passphrase, { compress: true });
  assert.strictEqual(fullDecoded.answers['0000'].text, 'Mustermann');
  assert.strictEqual(fullDecoded.answers['email'].text, 'max@example.com');
  assert.strictEqual(fullDecoded.answers['free'].text, 'Freitext XYZ');

  assert.strictEqual(fullDecoded.answers['1A00'].kind, 'multi');
  assert.deepStrictEqual(fullDecoded.answers['1A00'].indices, [0, 2, 4]);
  assert.strictEqual(fullDecoded.answers['1A00'].freeText, 'andere: starkes Frieren');

  // Ensure no stray __free record remains
  assert.ok(!fullDecoded.answers['1A00::__free'], 'internal __free darf nicht sichtbar bleiben');

  // Abuse-Case: falsche Passphrase darf NICHT entschlüsseln
  let wrongKeyOk = false;
  try {
    const last = encoded.passphrase.slice(-1);
    const wrongPassphrase = encoded.passphrase.slice(0, -1) + (last === '0' ? '1' : '0');
    await decodeDual(encoded.staticCode, encoded.privatePayload, wrongPassphrase, { compress: true });
    wrongKeyOk = true;
  } catch {
    // expected
  }
  assert.strictEqual(wrongKeyOk, false, 'falsche Passphrase darf nicht funktionieren');

  // eslint-disable-next-line no-console
  console.log('OK: test-anamnese-codec.js');
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});
