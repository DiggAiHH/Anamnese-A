/**
 * Global type definitions for Jest testing environment
 * Fixes: Code 2593, 2304 - Cannot find name 'describe', 'it', 'expect'
 */

import '@jest/globals';

declare global {
  const describe: jest.Describe;
  const it: jest.It;
  const test: jest.It;
  const expect: jest.Expect;
  const beforeEach: jest.Lifecycle;
  const afterEach: jest.Lifecycle;
  const beforeAll: jest.Lifecycle;
  const afterAll: jest.Lifecycle;
  const jest: typeof import('@jest/globals')['jest'];
}

export {};
