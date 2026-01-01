-- =============================================================================
-- SEED DATA - Test-Daten für lokale Entwicklung
-- =============================================================================
-- HISTORY-AWARE: This file is schema-compatible with database/schema.sql
-- DSGVO-SAFE: Keine echten Personendaten (nur invalid.test)

-- =============================================================================
-- PRACTICES (3 Test-Praxen)
-- =============================================================================
INSERT INTO practices (id, name, email, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Praxis A (Legacy Seed)', 'praxis-a@invalid.test', true),
  ('22222222-2222-2222-2222-222222222222', 'Praxis B (Legacy Seed)', 'praxis-b@invalid.test', true),
  ('33333333-3333-3333-3333-333333333333', 'Praxis C (Legacy Seed)', 'praxis-c@invalid.test', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  active = EXCLUDED.active;

-- =============================================================================
-- USERS (Praxis-Personal)
-- =============================================================================
-- bcryptjs hash for "password123"
INSERT INTO users (id, practice_id, email, password_hash, role, is_active) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'user@invalid.test',
    '$2b$10$hXiFbRVxMZtSLDARkVRZKORnfPiXvsGDdKO5aXW4dUHbbFB5.4DGq',
    'practice_admin',
    true
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  practice_id = EXCLUDED.practice_id,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- CODES (Test-Praxiscodes)
-- =============================================================================
INSERT INTO codes (code, practice_id, mode, language, stripe_session_id, used) VALUES
  ('TEST1234', '11111111-1111-1111-1111-111111111111', 'practice', 'de', 'cs_test_11111111', false),
  ('DEMO5678', '22222222-2222-2222-2222-222222222222', 'practice', 'de', 'cs_test_22222222', false)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- AUDIT LOG (Beispiel-Einträge)
-- =============================================================================
INSERT INTO audit_log (practice_id, action, details, ip_address, user_agent) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CODE_GENERATED', '{"mode": "practice", "language": "de"}', '127.0.0.0', 'sha256:0000000000000000000000000000000000000000000000000000000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'CODE_GENERATED', '{"mode": "practice", "language": "de"}', '127.0.0.0', 'sha256:0000000000000000000000000000000000000000000000000000000000000000');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- SELECT COUNT(*) FROM practices;
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM codes;
-- SELECT COUNT(*) FROM audit_log;
