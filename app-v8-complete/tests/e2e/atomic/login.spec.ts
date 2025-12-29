/**
 * ATOMIC TESTS - LOGIN & AUTHENTICATION
 * Tests: 1.1.1 - 1.1.6 aus ATOMIC_TESTING_CHECKLIST.md
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const API_URL = 'http://localhost:3000';

test.describe('Authentication - Login Modal', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // 1.1.1: Login Button öffnet Modal
  test('1.1.1: Login button opens modal', async ({ page }) => {
    // TODO: Implementiere Login-Button in index.html mit ID #login-btn
    // await page.click('#login-btn');
    // await expect(page.locator('.login-modal')).toBeVisible();
    
    // Placeholder
    console.log('⏳ Test 1.1.1: Wartet auf Login-UI-Implementation');
  });

  // 1.1.2: Email Input validiert Format
  test('1.1.2: Email input validates format', async ({ page }) => {
    // TODO: Implementiere Email-Validierung
    console.log('⏳ Test 1.1.2: Wartet auf Email-Validation');
  });

  // 1.1.4: Submit sendet POST-Request
  test('1.1.4: Submit sends POST request with credentials', async ({ page }) => {
    // Direkter API-Test (Backend ist bereits live)
    const response = await page.request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.token).toBeTruthy();
    expect(json.user.email).toBe('test@example.com');
  });

  // 1.1.5: Error Message bei falschen Credentials
  test('1.1.5: Shows error message on invalid credentials', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.error).toContain('Ungültige Anmeldedaten');
  });

  // Test: Backend Health-Check
  test('Backend Health Check responds correctly', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const json = await response.json();
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeTruthy();
    expect(json.version).toBe('8.2.0');
  });
});

test.describe('Authentication - JWT Token', () => {
  
  // Test: Protected Endpoint mit Token
  test('Protected endpoint requires valid token', async ({ page }) => {
    // Erst einloggen
    const loginResponse = await page.request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    const { token } = await loginResponse.json();

    // Dann protected Endpoint mit Token
    const profileResponse = await page.request.get(`${API_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(profileResponse.status()).toBe(200);
    const profile = await profileResponse.json();
    expect(profile.email).toBe('test@example.com');
  });

  // Test: Protected Endpoint ohne Token
  test('Protected endpoint rejects requests without token', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/user/profile`);
    expect(response.status()).toBe(401);
    
    const json = await response.json();
    expect(json.error).toContain('Kein Token');
  });
});
