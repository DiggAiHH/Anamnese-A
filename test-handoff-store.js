'use strict';

const assert = require('assert');
const { HandoffStore } = require('./handoff-store');

function future(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function past(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

(async () => {
  // Memory-mode, single-use default
  {
    const store = new HandoffStore({ pool: null, pepper: 'pepper', singleUse: true });
    const codeHash = store.hashCode('AbC123xYz890');

    const putRes = await store.put(codeHash, { ciphertext: 'abc', v: 1 }, future(5));
    assert.strictEqual(putRes.ok, true);
    assert.strictEqual(putRes.storage, 'memory');

    const take1 = await store.take(codeHash);
    assert.strictEqual(take1.found, true);
    assert.deepStrictEqual(take1.payload, { ciphertext: 'abc', v: 1 });

    const take2 = await store.take(codeHash);
    assert.strictEqual(take2.found, false);
  }

  // Memory-mode, expiry
  {
    const store = new HandoffStore({ pool: null, pepper: 'pepper', singleUse: true });
    const codeHash = store.hashCode('ZzZzZzZzZzZz');

    await store.put(codeHash, { ciphertext: 'abc', v: 1 }, past(1));

    const take = await store.take(codeHash);
    assert.strictEqual(take.found, false);
    assert.strictEqual(take.expired, true);
  }

  // Hash stability & pepper separation
  {
    const code = 'AAAAAAAAAAAA';
    const s1 = new HandoffStore({ pool: null, pepper: 'p1', singleUse: true });
    const s2 = new HandoffStore({ pool: null, pepper: 'p2', singleUse: true });

    assert.strictEqual(s1.hashCode(code).length, 64);
    assert.notStrictEqual(s1.hashCode(code), s2.hashCode(code));
    assert.strictEqual(s1.hashCode(code), s1.hashCode(code));
  }

  process.stdout.write('test-handoff-store.js: OK\n');
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
