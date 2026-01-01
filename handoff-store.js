'use strict';

const crypto = require('crypto');

/**
 * DSGVO-minimierter Handoff-Store.
 *
 * Design:
 * - Server speichert NUR verschlüsseltes Payload (Ciphertext) + Metadaten.
 * - Der 12-Zeichen Praxiscode ist gleichzeitig Lookup-Key und (optional) Entschlüsselungs-Passphrase.
 * - Um DB-Leaks zu entschärfen, wird als Primärschlüssel ein Hash gespeichert.
 * - Optional: single-use (Default) -> nach Abruf wird der Datensatz gelöscht.
 *
 * Security:
 * - Keine Logs von code/payload.
 * - Rate limiting muss auf Route-Ebene passieren.
 */
class HandoffStore {
  /**
   * @param {object} options
   * @param {import('pg').Pool|null} options.pool
   * @param {string} options.pepper
   * @param {boolean} options.singleUse
   */
  constructor({ pool, pepper, singleUse }) {
    this.pool = pool || null;
    this.pepper = String(pepper || '');
    this.singleUse = Boolean(singleUse);
    this.memory = new Map();
  }

  /**
   * @param {string} code
   * @returns {string} hex sha256
   */
  hashCode(code) {
    return crypto.createHash('sha256').update(this.pepper + String(code)).digest('hex');
  }

  /**
   * @param {string} codeHash
   * @param {object} payload
   * @param {Date} expiresAt
   */
  async put(codeHash, payload, expiresAt) {
    const exp = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

    if (!this.pool) {
      this.memory.set(codeHash, {
        payload,
        expiresAt: exp.getTime(),
        createdAt: Date.now()
      });
      return { ok: true, storage: 'memory' };
    }

    await this.pool.query(
      `INSERT INTO anamnese_handoffs (code_hash, payload, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (code_hash)
       DO UPDATE SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at, created_at = NOW()` ,
      [codeHash, payload, exp.toISOString()]
    );

    return { ok: true, storage: 'db' };
  }

  /**
   * @param {string} codeHash
   * @returns {Promise<{found: boolean, payload?: object, expired?: boolean, storage: 'memory'|'db'}>}
   */
  async take(codeHash) {
    if (!this.pool) {
      const row = this.memory.get(codeHash);
      if (!row) return { found: false, storage: 'memory' };
      if (Date.now() > row.expiresAt) {
        this.memory.delete(codeHash);
        return { found: false, expired: true, storage: 'memory' };
      }
      if (this.singleUse) {
        this.memory.delete(codeHash);
      }
      return { found: true, payload: row.payload, storage: 'memory' };
    }

    const res = await this.pool.query(
      `SELECT payload, expires_at
       FROM anamnese_handoffs
       WHERE code_hash = $1`,
      [codeHash]
    );

    if (res.rows.length === 0) return { found: false, storage: 'db' };

    const expiresAt = new Date(res.rows[0].expires_at).getTime();
    if (Date.now() > expiresAt) {
      await this.pool.query('DELETE FROM anamnese_handoffs WHERE code_hash = $1', [codeHash]);
      return { found: false, expired: true, storage: 'db' };
    }

    const payload = res.rows[0].payload;

    if (this.singleUse) {
      await this.pool.query('DELETE FROM anamnese_handoffs WHERE code_hash = $1', [codeHash]);
    } else {
      await this.pool.query(
        `UPDATE anamnese_handoffs
         SET retrieved_count = retrieved_count + 1, last_retrieved_at = NOW()
         WHERE code_hash = $1`,
        [codeHash]
      );
    }

    return { found: true, payload, storage: 'db' };
  }

  async cleanupExpired() {
    if (!this.pool) {
      const now = Date.now();
      for (const [k, v] of this.memory.entries()) {
        if (now > v.expiresAt) this.memory.delete(k);
      }
      return { ok: true, storage: 'memory' };
    }

    await this.pool.query('DELETE FROM anamnese_handoffs WHERE expires_at < NOW()');
    return { ok: true, storage: 'db' };
  }
}

module.exports = { HandoffStore };
