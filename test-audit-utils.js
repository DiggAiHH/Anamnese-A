const assert = require('assert');

const {
  normalizeMaybeIpV4Mapped,
  maskIpAddress,
  sha256Hex,
  sanitizeAuditDetails
} = require('./audit-utils');

function testMaskIp() {
  assert.strictEqual(normalizeMaybeIpV4Mapped('::ffff:127.0.0.1'), '127.0.0.1');
  assert.strictEqual(maskIpAddress('127.0.0.1'), '127.0.0.0');
  assert.strictEqual(maskIpAddress('::ffff:10.1.2.3'), '10.1.2.0');

  const v6 = maskIpAddress('2001:db8:abcd:0012:0000:0000:0000:0001');
  assert.strictEqual(v6, '2001:db8:abcd:0:0:0:0:0');

  const v6Compressed = maskIpAddress('2001:db8:abcd::1');
  assert.strictEqual(v6Compressed, '2001:db8:abcd:0:0:0:0:0');

  assert.strictEqual(maskIpAddress('not-an-ip'), null);
}

function testSha256() {
  const h1 = sha256Hex('x');
  const h2 = sha256Hex('x');
  assert.strictEqual(h1, h2);
  assert.strictEqual(h1.length, 64);
}

function testSanitizeAuditDetails() {
  const input = {
    email: 'a@b.c',
    patientData: { firstName: 'A', lastName: 'B', address: 'X', phone: 'Y' },
    ok: true,
    nested: {
      token: 'secret',
      note: 'hello'
    }
  };

  const out = sanitizeAuditDetails(input);
  assert.strictEqual(out.email, '[redacted]');
  assert.strictEqual(out.patientData, '[redacted]');
  assert.strictEqual(out.ok, true);
  assert.strictEqual(out.nested.token, '[redacted]');
  assert.strictEqual(out.nested.note, 'hello');

  const long = 'a'.repeat(2005);
  const out2 = sanitizeAuditDetails({ msg: long });
  assert.ok(out2.msg.startsWith('a'.repeat(1000)));
}

try {
  testMaskIp();
  testSha256();
  testSanitizeAuditDetails();
  process.stdout.write('test-audit-utils.js: OK\n');
} catch (e) {
  process.stderr.write(`test-audit-utils.js: FAIL\n${e.stack || e.message}\n`);
  process.exit(1);
}
