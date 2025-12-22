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
