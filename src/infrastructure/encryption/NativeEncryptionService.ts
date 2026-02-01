/**
 * Web-kompatibler Encryption Service.
 *
 * Hinweis: CryptoJS unterstützt AES-GCM nicht nativ. Für die Web-Build-Pipeline
 * nutzen wir daher AES-CBC + PKCS7 Padding.
 *
 * @security Keine PII wird geloggt oder extern übertragen (DSGVO Art. 25).
 */

import * as CryptoJS from 'crypto-js';
import { EncryptedDataVO } from '@domain/value-objects/EncryptedData';
import { IEncryptionService } from '@domain/repositories/IEncryptionService';

function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');

  return { valid: errors.length === 0, errors };
}

const SHARED_PBKDF2_ITERATIONS = 100000;

export class NativeEncryptionService implements IEncryptionService {
  private readonly KEY_LENGTH = 32; // 256 bit
  private readonly IV_LENGTH = 16; // 128 bit (AES block size)
  private readonly SALT_LENGTH = 16; // 128 bit
  private readonly PBKDF2_ITERATIONS = SHARED_PBKDF2_ITERATIONS;

  async deriveKey(password: string, salt?: string): Promise<{ key: string; salt: string }> {
    this.ensurePasswordStrength(password);

    const saltStr =
      salt ?? CryptoJS.lib.WordArray.random(this.SALT_LENGTH).toString(CryptoJS.enc.Base64);

    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Base64.parse(saltStr), {
      keySize: this.KEY_LENGTH / 4,
      iterations: this.PBKDF2_ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    });

    return { key: key.toString(CryptoJS.enc.Base64), salt: saltStr };
  }

  async encrypt(data: string, key: string): Promise<EncryptedDataVO> {
    try {
      const keyWordArray = CryptoJS.enc.Base64.parse(key);
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);
      const salt = CryptoJS.lib.WordArray.random(this.SALT_LENGTH);

      const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return EncryptedDataVO.create({
        ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
        iv: iv.toString(CryptoJS.enc.Base64),
        authTag: '',
        salt: salt.toString(CryptoJS.enc.Base64),
      });
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async decrypt(encryptedData: EncryptedDataVO, key: string): Promise<string> {
    try {
      const keyWordArray = CryptoJS.enc.Base64.parse(key);
      const ciphertext = CryptoJS.enc.Base64.parse(encryptedData.ciphertext);
      const iv = CryptoJS.enc.Base64.parse(encryptedData.iv);

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext } as CryptoJS.lib.CipherParams,
        keyWordArray,
        {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        },
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Wrong key or corrupted data'}`,
      );
    }
  }

  async hashPassword(password: string): Promise<string> {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const computedHash = await this.hashPassword(password);
    return computedHash === hash;
  }

  async generateRandomString(length: number): Promise<string> {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Base64);
  }

  private ensurePasswordStrength(password: string): void {
    const result = validatePasswordStrength(password);
    if (!result.valid) {
      throw new Error(`Password policy violation: ${result.errors.join('; ')}`);
    }
  }
}

export const encryptionService = new NativeEncryptionService();
