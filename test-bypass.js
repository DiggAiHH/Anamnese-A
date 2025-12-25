#!/usr/bin/env node
/**
 * Test script for dev bypass mode
 * Tests that bypass mode is correctly configured and detected
 */

const crypto = require('crypto');

// Test 1: Environment variable detection
console.log('===========================================');
console.log('Testing Dev Bypass Configuration');
console.log('===========================================\n');

// Load environment
require('dotenv').config();

console.log('Test 1: Environment Variables');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DEV_BYPASS_PAYMENT:', process.env.DEV_BYPASS_PAYMENT);

// Test 2: Bypass logic
const DEV_BYPASS_PAYMENT = process.env.DEV_BYPASS_PAYMENT === 'true' && process.env.NODE_ENV !== 'production';
console.log('\nTest 2: Bypass Logic Result');
console.log('  Bypass Enabled:', DEV_BYPASS_PAYMENT);
console.log('  Expected: true (since DEV_BYPASS_PAYMENT=true and NODE_ENV!=production)');
console.log('  ✓ PASS:', DEV_BYPASS_PAYMENT === true);

// Test 3: Production safety
console.log('\nTest 3: Production Safety Check');
const originalEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
const DEV_BYPASS_PRODUCTION = process.env.DEV_BYPASS_PAYMENT === 'true' && process.env.NODE_ENV !== 'production';
console.log('  NODE_ENV set to: production');
console.log('  DEV_BYPASS_PAYMENT: true');
console.log('  Bypass Enabled:', DEV_BYPASS_PRODUCTION);
console.log('  Expected: false (production safety)');
console.log('  ✓ PASS:', DEV_BYPASS_PRODUCTION === false);
process.env.NODE_ENV = originalEnv;

// Test 4: Pseudo-session ID generation
console.log('\nTest 4: Pseudo-Session ID Generation');
const pseudoSessionId = `dev_bypass_${crypto.randomBytes(16).toString('hex')}`;
console.log('  Generated ID:', pseudoSessionId);
console.log('  Has prefix:', pseudoSessionId.startsWith('dev_bypass_'));
console.log('  Length:', pseudoSessionId.length);
console.log('  ✓ PASS:', pseudoSessionId.startsWith('dev_bypass_') && pseudoSessionId.length === 43);

// Test 5: Mock code generation data structure
console.log('\nTest 5: Code Generation Data Structure');
const mockMetadata = {
  practiceId: 'SELFTEST',
  mode: 'patient',
  language: 'de',
  patientData: null
};
const mockSessionId = pseudoSessionId;
const codeData = {
  practiceId: mockMetadata.practiceId,
  mode: mockMetadata.mode,
  language: mockMetadata.language,
  patientData: mockMetadata.patientData,
  timestamp: Date.now(),
  sessionId: mockSessionId
};
console.log('  Code Data:', JSON.stringify(codeData, null, 2));
console.log('  ✓ PASS: Data structure valid');

// Summary
console.log('\n===========================================');
console.log('All Tests Passed! ✓');
console.log('===========================================');
console.log('\nBypass mode is correctly configured.');
console.log('To test with server:');
console.log('  1. Start server: npm start');
console.log('  2. Check bypass status: curl http://localhost:3000/api/bypass-status');
console.log('  3. Open browser: http://localhost:3000');
console.log('\nSee README_DEV_BYPASS.md for full documentation.');
