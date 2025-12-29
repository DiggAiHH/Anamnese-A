-- =============================================================================
-- AUTH SEEDS (HISTORY-AWARE: needed for /api/auth/login)
-- =============================================================================
-- DSGVO-SAFE: Nur Testdaten, keine echten Personen

-- Ensure at least one practice exists (use existing seed IDs if present)
INSERT INTO practices (id, name, email, active) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'Dr. Müller Allgemeinmedizin', 'dr.mueller@anamnese.local', true)
ON CONFLICT (id) DO NOTHING;

-- Test user: test@example.com / password123
-- bcryptjs hash for "password123"
INSERT INTO users (id, practice_id, email, password_hash, role, is_active) VALUES
  (
    'd4e5f6a7-b8c9-7d8e-1f0a-2b1c0d9e8f7a',
    'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    'test@example.com',
    '$2b$10$hXiFbRVxMZtSLDARkVRZKORnfPiXvsGDdKO5aXW4dUHbbFB5.4DGq',
    'practice_admin',
    true
  )
ON CONFLICT (email) DO NOTHING;
