-- =============================================================================
-- DATABASE EXTENSIONS
-- =============================================================================
-- HISTORY-AWARE: schema uses gen_random_uuid(); provided by pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Praxen/Medizinische Einrichtungen
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practices_email ON practices(email);

-- Generierte Codes
CREATE TABLE IF NOT EXISTS codes (
  id BIGSERIAL PRIMARY KEY,
  practice_id UUID NOT NULL REFERENCES practices(id),
  code TEXT NOT NULL UNIQUE,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('practice', 'patient')),
  language VARCHAR(10) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codes_practice_id ON codes(practice_id);
CREATE INDEX IF NOT EXISTS idx_codes_stripe_session ON codes(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_codes_created_at ON codes(created_at);

-- Transaktionen (für Buchhaltung)
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  practice_id UUID NOT NULL REFERENCES practices(id),
  stripe_session_id VARCHAR(255) NOT NULL,
  amount_total INT NOT NULL, -- in Cent
  amount_net INT NOT NULL,
  tax_amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_practice_id ON transactions(practice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Audit-Log (DSGVO Art. 30)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  practice_id UUID REFERENCES practices(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_practice_id ON audit_log(practice_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- =============================================================================
-- AUTH TABLES (HISTORY-AWARE: align with middleware/auth.js expectations)
-- =============================================================================

-- Users (minimal: practice admins/operators)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID REFERENCES practices(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'practice_admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_practice_id ON users(practice_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
  metadata JSONB,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- DSGVO-minimierter Anamnese Handoff Store
-- Speichert ausschließlich verschlüsselte Payloads (Client-seitig / E2E) + Ablaufzeit.
-- Der Code wird nicht im Klartext gespeichert, sondern nur als Hash (mit Pepper).
-- =============================================================================
CREATE TABLE IF NOT EXISTS anamnese_handoffs (
  code_hash VARCHAR(64) PRIMARY KEY,
  payload JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retrieved_count INTEGER NOT NULL DEFAULT 0,
  last_retrieved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_anamnese_handoffs_expires_at ON anamnese_handoffs (expires_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
