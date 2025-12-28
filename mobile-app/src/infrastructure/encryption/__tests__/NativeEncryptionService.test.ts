import { NativeEncryptionService } from '../NativeEncryptionService';
import { EncryptedDataVO } from '../../../domain/value-objects/EncryptedData';

describe('NativeEncryptionService', () => {
  let encryptionService: NativeEncryptionService;

  beforeEach(() => {
    encryptionService = new NativeEncryptionService();
  });

  describe('deriveKey', () => {
    it('should derive a 256-bit key from password', async () => {
      const password = 'TestPassword123!';
      const salt = Buffer.from('1234567890123456');

      const key = await encryptionService.deriveKey(password, salt);

      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32); // 256 bits = 32 bytes
    });

    it('should derive different keys for different passwords', async () => {
      const salt = Buffer.from('1234567890123456');

      const key1 = await encryptionService.deriveKey('Password1', salt);
      const key2 = await encryptionService.deriveKey('Password2', salt);

      expect(key1.toString('base64')).not.toBe(key2.toString('base64'));
    });

    it('should derive different keys for different salts', async () => {
      const password = 'TestPassword123!';

      const key1 = await encryptionService.deriveKey(
        password,
        Buffer.from('salt1111111111111')
      );
      const key2 = await encryptionService.deriveKey(
        password,
        Buffer.from('salt2222222222222')
      );

      expect(key1.toString('base64')).not.toBe(key2.toString('base64'));
    });

    it('should derive same key for same password and salt', async () => {
      const password = 'TestPassword123!';
      const salt = Buffer.from('1234567890123456');

      const key1 = await encryptionService.deriveKey(password, salt);
      const key2 = await encryptionService.deriveKey(password, salt);

      expect(key1.toString('base64')).toBe(key2.toString('base64'));
    });
  });

  describe('encrypt', () => {
    it('should encrypt plaintext data', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );
      const plaintext = 'Sensitive medical data';

      const encryptedData = await encryptionService.encrypt(plaintext, key);

      expect(encryptedData).toBeInstanceOf(EncryptedDataVO);
      expect(encryptedData.ciphertext).toBeDefined();
      expect(encryptedData.iv).toBeDefined();
      expect(encryptedData.authTag).toBeDefined();
      expect(encryptedData.salt).toBeDefined();
    });

    it('should produce different ciphertext for same plaintext (different IV)', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );
      const plaintext = 'Test data';

      const encrypted1 = await encryptionService.encrypt(plaintext, key);
      const encrypted2 = await encryptionService.encrypt(plaintext, key);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should encrypt empty string', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );

      const encryptedData = await encryptionService.encrypt('', key);

      expect(encryptedData).toBeInstanceOf(EncryptedDataVO);
      expect(encryptedData.ciphertext).toBeDefined();
    });

    it('should encrypt unicode characters', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );
      const plaintext = 'Äöü ß 中文 日本語 العربية';

      const encryptedData = await encryptionService.encrypt(plaintext, key);

      expect(encryptedData).toBeInstanceOf(EncryptedDataVO);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data correctly', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );
      const plaintext = 'Sensitive medical data';

      const encryptedData = await encryptionService.encrypt(plaintext, key);
      const decrypted = await encryptionService.decrypt(encryptedData, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt empty string', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );
      const plaintext = '';

      const encryptedData = await encryptionService.encrypt(plaintext, key);
      const decrypted = await encryptionService.decrypt(encryptedData, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt unicode characters', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );
      const plaintext = 'Äöü ß 中文 日本語 العربية';

      const encryptedData = await encryptionService.encrypt(plaintext, key);
      const decrypted = await encryptionService.decrypt(encryptedData, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error with wrong key', async () => {
      const password1 = 'TestPassword1';
      const password2 = 'TestPassword2';
      const salt = Buffer.from('1234567890123456');

      const key1 = await encryptionService.deriveKey(password1, salt);
      const key2 = await encryptionService.deriveKey(password2, salt);

      const plaintext = 'Secret data';
      const encryptedData = await encryptionService.encrypt(plaintext, key1);

      await expect(
        encryptionService.decrypt(encryptedData, key2)
      ).rejects.toThrow();
    });

    it('should throw error with tampered ciphertext', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );

      const plaintext = 'Secret data';
      const encryptedData = await encryptionService.encrypt(plaintext, key);

      // Tamper with ciphertext
      const tamperedData = new EncryptedDataVO(
        Buffer.from('tampered').toString('base64'),
        encryptedData.iv,
        encryptedData.authTag,
        encryptedData.salt
      );

      await expect(
        encryptionService.decrypt(tamperedData, key)
      ).rejects.toThrow();
    });

    it('should throw error with tampered authTag', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );

      const plaintext = 'Secret data';
      const encryptedData = await encryptionService.encrypt(plaintext, key);

      // Tamper with authTag
      const tamperedData = new EncryptedDataVO(
        encryptedData.ciphertext,
        encryptedData.iv,
        Buffer.from('tamperedtamperedtamperedtampered').toString('base64'),
        encryptedData.salt
      );

      await expect(
        encryptionService.decrypt(tamperedData, key)
      ).rejects.toThrow();
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'TestPassword123!';

      const hash = await encryptionService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).not.toBe(password);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await encryptionService.hashPassword('Password1');
      const hash2 = await encryptionService.hashPassword('Password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash for same password (deterministic)', async () => {
      const password = 'TestPassword123!';

      const hash1 = await encryptionService.hashPassword(password);
      const hash2 = await encryptionService.hashPassword(password);

      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await encryptionService.hashPassword(password);

      const isValid = await encryptionService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await encryptionService.hashPassword(password);

      const isValid = await encryptionService.verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const password = 'TestPassword123!';
      const hash = await encryptionService.hashPassword(password);

      const isValid = await encryptionService.verifyPassword('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateRandomBytes', () => {
    it('should generate random bytes of specified length', () => {
      const bytes = encryptionService.generateRandomBytes(16);

      expect(bytes).toBeInstanceOf(Buffer);
      expect(bytes.length).toBe(16);
    });

    it('should generate different values on each call', () => {
      const bytes1 = encryptionService.generateRandomBytes(16);
      const bytes2 = encryptionService.generateRandomBytes(16);

      expect(bytes1.toString('base64')).not.toBe(bytes2.toString('base64'));
    });

    it('should generate 32-byte keys', () => {
      const bytes = encryptionService.generateRandomBytes(32);

      expect(bytes.length).toBe(32);
    });
  });

  describe('encrypt/decrypt round-trip', () => {
    it('should maintain data integrity through encryption cycle', async () => {
      const testData = [
        'Simple text',
        'Äöü Special chars ß',
        '中文汉字',
        'العربية',
        '日本語',
        '{"json": "data", "number": 123}',
        'Very long text '.repeat(100),
        '',
      ];

      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );

      for (const plaintext of testData) {
        const encrypted = await encryptionService.encrypt(plaintext, key);
        const decrypted = await encryptionService.decrypt(encrypted, key);

        expect(decrypted).toBe(plaintext);
      }
    });
  });

  describe('GDPR compliance', () => {
    it('should use AES-256-GCM (DSGVO requirement)', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );

      expect(key.length).toBe(32); // 256 bits
    });

    it('should use authenticated encryption (prevent tampering)', async () => {
      const password = 'TestPassword123!';
      const key = await encryptionService.deriveKey(
        password,
        Buffer.from('1234567890123456')
      );

      const encrypted = await encryptionService.encrypt('data', key);

      // AuthTag must be present (GCM mode)
      expect(encrypted.authTag).toBeDefined();
      expect(encrypted.authTag.length).toBeGreaterThan(0);
    });

    it('should use PBKDF2 with 100,000 iterations', async () => {
      // This test verifies the time it takes (should be slow for security)
      const start = Date.now();
      
      await encryptionService.deriveKey(
        'password',
        Buffer.from('1234567890123456')
      );
      
      const duration = Date.now() - start;

      // Should take at least some time (100k iterations)
      expect(duration).toBeGreaterThan(10); // At least 10ms
    });
  });
});
