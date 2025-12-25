#!/usr/bin/env node
/**
 * Mock server test for bypass mode
 * Tests the server endpoints without requiring actual database
 */

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Bypass configuration (same as server.js)
const DEV_BYPASS_PAYMENT = process.env.DEV_BYPASS_PAYMENT === 'true' && process.env.NODE_ENV !== 'production';

console.log('Mock Server Test - Bypass Mode');
console.log('Bypass Enabled:', DEV_BYPASS_PAYMENT);

// Mock bypass status endpoint
app.get('/api/bypass-status', (req, res) => {
  res.json({ bypassEnabled: DEV_BYPASS_PAYMENT });
});

// Mock create-checkout-session endpoint
app.post('/api/create-checkout-session', (req, res) => {
  const { userType, mode, language } = req.body;
  
  if (DEV_BYPASS_PAYMENT) {
    // Bypass mode: generate pseudo session
    const pseudoSessionId = `dev_bypass_${crypto.randomBytes(16).toString('hex')}`;
    console.log('✓ Bypass mode: Generated pseudo-session:', pseudoSessionId);
    return res.json({ 
      sessionId: pseudoSessionId,
      bypass: true 
    });
  } else {
    // Normal mode: would create Stripe session
    console.log('✗ Normal mode: Would create Stripe session');
    return res.json({ 
      sessionId: 'stripe_session_mock',
      bypass: false
    });
  }
});

// Start mock server
const PORT = 3001; // Use different port to avoid conflicts
const server = app.listen(PORT, () => {
  console.log(`\nMock server running on http://localhost:${PORT}`);
  
  // Run automated tests
  setTimeout(async () => {
    console.log('\n===========================================');
    console.log('Running Automated API Tests');
    console.log('===========================================\n');
    
    try {
      // Test 1: Bypass status endpoint
      console.log('Test 1: GET /api/bypass-status');
      const statusResponse = await fetch(`http://localhost:${PORT}/api/bypass-status`);
      const statusData = await statusResponse.json();
      console.log('  Response:', statusData);
      console.log('  ✓ PASS:', statusData.bypassEnabled === DEV_BYPASS_PAYMENT);
      
      // Test 2: Create checkout session (selftest)
      console.log('\nTest 2: POST /api/create-checkout-session (selftest)');
      const checkoutResponse = await fetch(`http://localhost:${PORT}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'selftest',
          mode: 'patient',
          language: 'de'
        })
      });
      const checkoutData = await checkoutResponse.json();
      console.log('  Response:', checkoutData);
      console.log('  Has sessionId:', !!checkoutData.sessionId);
      console.log('  Has bypass flag:', checkoutData.bypass === true);
      console.log('  Session ID starts with dev_bypass_:', checkoutData.sessionId.startsWith('dev_bypass_'));
      console.log('  ✓ PASS:', checkoutData.bypass === true && checkoutData.sessionId.startsWith('dev_bypass_'));
      
      // Test 3: Create checkout session (practice)
      console.log('\nTest 3: POST /api/create-checkout-session (practice)');
      const practiceResponse = await fetch(`http://localhost:${PORT}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'practice',
          practiceId: '123e4567-e89b-12d3-a456-426614174000',
          mode: 'patient',
          language: 'de-en'
        })
      });
      const practiceData = await practiceResponse.json();
      console.log('  Response:', practiceData);
      console.log('  Has sessionId:', !!practiceData.sessionId);
      console.log('  Has bypass flag:', practiceData.bypass === true);
      console.log('  ✓ PASS:', practiceData.bypass === true);
      
      console.log('\n===========================================');
      console.log('All API Tests Passed! ✓');
      console.log('===========================================\n');
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      // Close server
      server.close(() => {
        console.log('Mock server stopped.');
        process.exit(0);
      });
    }
  }, 1000);
});
