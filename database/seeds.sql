-- =============================================================================
-- SEED DATA - Test-Daten für lokale Entwicklung
-- =============================================================================
-- HISTORY-AWARE: Dummy-Daten für Development/Testing
-- DSGVO-SAFE: Keine echten Personendaten

-- =============================================================================
-- PRACTICES (3 Test-Praxen)
-- =============================================================================
INSERT INTO practices (id, name, address, phone, email, subscription_tier, subscription_expires_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Hausarztpraxis Dr. Müller', 'Hauptstraße 1, 10115 Berlin', '+49 30 12345678', 'praxis@mueller.de', 'premium', NOW() + INTERVAL '1 year'),
  ('22222222-2222-2222-2222-222222222222', 'Zahnarztpraxis Schneider', 'Bahnhofstraße 10, 80331 München', '+49 89 87654321', 'info@schneider-dental.de', 'standard', NOW() + INTERVAL '6 months'),
  ('33333333-3333-3333-3333-333333333333', 'Klinik am Ring', 'Ringstraße 25, 20095 Hamburg', '+49 40 11223344', 'kontakt@klinik-ring.de', 'enterprise', NOW() + INTERVAL '2 years')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_expires_at = EXCLUDED.subscription_expires_at;

-- =============================================================================
-- USERS (Praxis-Personal)
-- =============================================================================
-- Password Hash: bcrypt('admin123', rounds=10)
-- Generate with: node -e "console.log(require('bcrypt').hashSync('admin123', 10))"
INSERT INTO users (id, email, password_hash, role, practice_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@anamnese.local', '$2b$10$YourHashHere', 'admin', NULL),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.mueller@anamnese.local', '$2b$10$YourHashHere', 'user', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'schneider@anamnese.local', '$2b$10$YourHashHere', 'user', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'klinik@anamnese.local', '$2b$10$YourHashHere', 'user', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  practice_id = EXCLUDED.practice_id;

-- =============================================================================
-- CODES (Test-Praxiscodes)
-- =============================================================================
INSERT INTO codes (code, practice_id, mode, language, payment_status, expires_at) VALUES
  ('TEST1234', '11111111-1111-1111-1111-111111111111', 'practice', 'de', 'completed', NOW() + INTERVAL '30 days'),
  ('DEMO5678', '22222222-2222-2222-2222-222222222222', 'practice', 'de', 'completed', NOW() + INTERVAL '30 days'),
  ('CLINIC99', '33333333-3333-3333-3333-333333333333', 'practice', 'en', 'completed', NOW() + INTERVAL '30 days'),
  ('SELF0001', NULL, 'self-test', 'de', 'completed', NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO UPDATE SET
  payment_status = EXCLUDED.payment_status,
  expires_at = EXCLUDED.expires_at;

-- =============================================================================
-- AUDIT LOGS (Beispiel-Einträge)
-- =============================================================================
INSERT INTO audit_logs (user_id, practice_id, action, resource_type, resource_id, metadata) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'code_generated', 'code', 'TEST1234', '{"note": "Test-Code für Entwicklung"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'code_generated', 'code', 'DEMO5678', '{"note": "Demo-Code"}');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- SELECT COUNT(*) FROM practices; -- Expected: 3
-- SELECT COUNT(*) FROM users;     -- Expected: 4
-- SELECT COUNT(*) FROM codes;     -- Expected: 4
-- SELECT COUNT(*) FROM audit_logs; -- Expected: 2
