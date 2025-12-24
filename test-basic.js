/**
 * Basic tests for Praxis-Code-Generator
 */

const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

// SECURITY WARNING: This test key is for testing purposes ONLY.
// It is deterministically generated from a seed to ensure reproducibility in tests.
// NEVER use this key in production environments.
// In production, always use a cryptographically secure random key from environment variables.
const TEST_KEY_SEED = 'anamnese-test-suite-2025';
const TEST_KEY = crypto.createHash('sha256').update(TEST_KEY_SEED).digest('hex');
const MASTER_KEY = process.env.MASTER_KEY || TEST_KEY;

// Helper function for AES-256 encryption (from server.js)
function encryptData(data) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(MASTER_KEY, 'hex');
  const iv = crypto.randomBytes(12);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ]).toString('base64');
}

// Helper function for AES-256 decryption
function decryptData(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(MASTER_KEY, 'hex');
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const iv = buffer.slice(0, 12);
  const authTag = buffer.slice(12, 28);
  const encrypted = buffer.slice(28);
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Test encryption/decryption
function testEncryption() {
  console.log('Testing AES-256-GCM Encryption...');
  
  const testData = {
    practiceId: '123e4567-e89b-12d3-a456-426614174000',
    mode: 'practice',
    language: 'de-en',
    patientData: {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthDate: '1990-01-01'
    },
    timestamp: Date.now()
  };
  
  try {
    // Encrypt
    const encrypted = encryptData(JSON.stringify(testData));
    console.log('✓ Encryption successful');
    console.log('  Encrypted length:', encrypted.length);
    
    // Decrypt
    const decrypted = decryptData(encrypted);
    const decryptedData = JSON.parse(decrypted);
    console.log('✓ Decryption successful');
    
    // Verify
    if (JSON.stringify(testData) === JSON.stringify(decryptedData)) {
      console.log('✓ Data integrity verified');
      return true;
    } else {
      console.error('✗ Data mismatch after decryption');
      return false;
    }
  } catch (error) {
    console.error('✗ Encryption test failed:', error.message);
    return false;
  }
}

// Test UUID validation
function testUUIDValidation() {
  console.log('\nTesting UUID Validation...');
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const invalidUUIDs = [
    'not-a-uuid',
    '123e4567-e89b-12d3-a456',
    '123e4567e89b12d3a456426614174000',
    ''
  ];
  
  // Test valid UUID
  if (uuidRegex.test(validUUID)) {
    console.log('✓ Valid UUID accepted');
  } else {
    console.error('✗ Valid UUID rejected');
    return false;
  }
  
  // Test invalid UUIDs
  for (const uuid of invalidUUIDs) {
    if (!uuidRegex.test(uuid)) {
      console.log('✓ Invalid UUID rejected:', uuid);
    } else {
      console.error('✗ Invalid UUID accepted:', uuid);
      return false;
    }
  }
  
  return true;
}

// Test HMAC session secret generation
function testSessionSecret() {
  console.log('\nTesting HMAC Session Secret Generation...');
  
  try {
    const practiceId = '123e4567-e89b-12d3-a456-426614174000';
    const timestamp1 = Date.now();
    const secret1 = crypto.createHmac('sha256', MASTER_KEY)
      .update(practiceId + timestamp1)
      .digest('hex');
    
    // Generate another secret with different timestamp
    const timestamp2 = timestamp1 + 1000; // 1 second later
    const secret2 = crypto.createHmac('sha256', MASTER_KEY)
      .update(practiceId + timestamp2)
      .digest('hex');
    
    console.log('✓ Secret 1 generated:', secret1.substring(0, 16) + '...');
    console.log('✓ Secret 2 generated:', secret2.substring(0, 16) + '...');
    
    if (secret1 !== secret2) {
      console.log('✓ Secrets are unique (different timestamps)');
      return true;
    } else {
      console.error('✗ Secrets are identical (should be different)');
      return false;
    }
  } catch (error) {
    console.error('✗ Session secret test failed:', error.message);
    return false;
  }
}

// Run all tests
function runTests() {
  console.log('=================================');
  console.log('Praxis-Code-Generator Test Suite');
  console.log('=================================\n');
  
  const results = [
    testEncryption(),
    testUUIDValidation(),
    testSessionSecret()
  ];
  
  console.log('\n=================================');
  console.log('Test Results:');
  console.log('=================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests();
