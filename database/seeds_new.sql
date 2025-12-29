-- =============================================================================
-- SEED DATA - Test Data for Development (HISTORY-AWARE: Match actual schema)
-- =============================================================================

-- Practices (3 Test-Praxen)
INSERT INTO practices (id, name, email, active) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'Dr. Müller Allgemeinmedizin', 'dr.mueller@anamnese.local', true),
  ('b2c3d4e5-f6a7-5b6c-9d8e-0f9a8b7c6d5e', 'Praxis Dr. Schmidt', 'dr.schmidt@anamnese.local', true),
  ('c3d4e5f6-a7b8-6c7d-0e9f-1a0b9c8d7e6f', 'MVZ Gesundheitszentrum', 'info@mvz-gesundheit.local', true)
ON CONFLICT (id) DO NOTHING;

-- Codes (4 Test-Codes)
INSERT INTO codes (code, practice_id, mode, language, stripe_session_id, used) VALUES
  ('TEST1234', 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'practice', 'de', 'cs_test_a1b2c3d4e5f6g7h8', false),
  ('DEMO5678', 'b2c3d4e5-f6a7-5b6c-9d8e-0f9a8b7c6d5e', 'practice', 'de', 'cs_test_b2c3d4e5f6a7b8c9', false),
  ('PATIENT001', 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'patient', 'de', 'cs_test_patient001', false),
  ('PATIENT002', 'c3d4e5f6-a7b8-6c7d-0e9f-1a0b9c8d7e6f', 'patient', 'de', 'cs_test_patient002', false)
ON CONFLICT (code) DO NOTHING;

-- Transactions (2 Test-Transaktionen)
INSERT INTO transactions (practice_id, stripe_session_id, amount_total, amount_net, tax_amount, currency, status) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'cs_test_a1b2c3d4e5f6g7h8', 4900, 4118, 782, 'EUR', 'paid'),
  ('b2c3d4e5-f6a7-5b6c-9d8e-0f9a8b7c6d5e', 'cs_test_b2c3d4e5f6a7b8c9', 4900, 4118, 782, 'EUR', 'paid');

-- Audit Logs (3 Test-Einträge)
INSERT INTO audit_log (practice_id, action, details, ip_address, user_agent) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'CODE_GENERATED', '{"mode": "practice", "language": "de"}', '127.0.0.1', 'Mozilla/5.0'),
  ('b2c3d4e5-f6a7-5b6c-9d8e-0f9a8b7c6d5e', 'CODE_GENERATED', '{"mode": "practice", "language": "de"}', '127.0.0.1', 'Mozilla/5.0'),
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'CODE_RETRIEVED', '{"sessionId": "cs_test_a1b2c3d4e5f6g7h8"}', '127.0.0.1', 'Mozilla/5.0');
