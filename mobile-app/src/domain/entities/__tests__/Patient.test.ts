import { PatientEntity } from '../Patient';
import { EncryptedDataVO } from '../../value-objects/EncryptedData';
import { GDPRConsentEntity } from '../GDPRConsent';

describe('PatientEntity', () => {
  const mockEncryptedData = new EncryptedDataVO(
    Buffer.from('ciphertext').toString('base64'),
    Buffer.from('1234567890123456').toString('base64'),
    Buffer.from('authTag').toString('base64'),
    Buffer.from('salt').toString('base64')
  );

  const mockConsents: GDPRConsentEntity[] = [
    {
      id: 'consent-1',
      patientId: 'patient-1',
      type: 'data_processing',
      granted: true,
      grantedAt: new Date('2025-01-01'),
      revokedAt: null,
      privacyPolicyVersion: '1.0.0',
      legalBasis: 'Art. 6(1)(a) DSGVO - Einwilligung',
      purpose: 'Medizinische Datenerfassung und -verarbeitung',
      dataCategories: ['name', 'birthDate', 'medicalHistory'],
      recipients: null,
      retentionPeriod: '10 Jahre gemäß § 630f BGB',
      auditLog: [
        {
          action: 'created',
          timestamp: new Date('2025-01-01'),
          details: 'Consent granted during registration',
        },
      ],
      isActive: () => true,
      revoke: function () {
        this.granted = false;
        this.revokedAt = new Date();
        this.auditLog.push({
          action: 'updated',
          timestamp: new Date(),
          details: 'Consent revoked',
        });
      },
      grant: function () {
        this.granted = true;
        this.grantedAt = new Date();
        this.revokedAt = null;
        this.auditLog.push({
          action: 'updated',
          timestamp: new Date(),
          details: 'Consent granted',
        });
      },
      shouldBeDeleted: () => false,
    },
  ];

  describe('create', () => {
    it('should create a new patient with valid data', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      expect(patient.id).toBeDefined();
      expect(patient.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(patient.encryptedData).toBe(mockEncryptedData);
      expect(patient.language).toBe('de');
      expect(patient.gdprConsents).toHaveLength(1);
      expect(patient.createdAt).toBeInstanceOf(Date);
      expect(patient.updatedAt).toBeInstanceOf(Date);
      expect(patient.auditLog).toHaveLength(1);
      expect(patient.auditLog[0].action).toBe('created');
    });

    it('should throw error if consents array is empty', () => {
      expect(() => {
        PatientEntity.create(mockEncryptedData, 'de', []);
      }).toThrow('At least one GDPR consent is required');
    });

    it('should throw error for invalid language code', () => {
      expect(() => {
        PatientEntity.create(mockEncryptedData, 'invalid', mockConsents);
      }).toThrow();
    });
  });

  describe('update', () => {
    it('should update patient data and add audit log entry', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      const newEncryptedData = new EncryptedDataVO(
        Buffer.from('new_ciphertext').toString('base64'),
        Buffer.from('9876543210987654').toString('base64'),
        Buffer.from('newAuthTag').toString('base64'),
        Buffer.from('newSalt').toString('base64')
      );

      const updatedPatient = patient.update(newEncryptedData, 'en');

      expect(updatedPatient.encryptedData).toBe(newEncryptedData);
      expect(updatedPatient.language).toBe('en');
      expect(updatedPatient.updatedAt.getTime()).toBeGreaterThan(patient.updatedAt.getTime());
      expect(updatedPatient.auditLog).toHaveLength(2);
      expect(updatedPatient.auditLog[1].action).toBe('updated');
    });

    it('should maintain immutability - not modify original', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      const originalUpdatedAt = patient.updatedAt;
      const originalAuditLogLength = patient.auditLog.length;

      const newEncryptedData = new EncryptedDataVO(
        Buffer.from('new').toString('base64'),
        Buffer.from('1234567890123456').toString('base64'),
        Buffer.from('tag').toString('base64'),
        Buffer.from('salt').toString('base64')
      );

      patient.update(newEncryptedData, 'fr');

      expect(patient.updatedAt).toBe(originalUpdatedAt);
      expect(patient.auditLog.length).toBe(originalAuditLogLength);
    });
  });

  describe('addGDPRConsent', () => {
    it('should add new consent to patient', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      const newConsent: GDPRConsentEntity = {
        ...mockConsents[0],
        id: 'consent-2',
        type: 'gdt_export',
        purpose: 'Export to practice management system',
      };

      const updatedPatient = patient.addGDPRConsent(newConsent);

      expect(updatedPatient.gdprConsents).toHaveLength(2);
      expect(updatedPatient.gdprConsents[1].id).toBe('consent-2');
      expect(updatedPatient.auditLog[1].action).toBe('updated');
      expect(updatedPatient.auditLog[1].details).toContain('GDPR consent added');
    });
  });

  describe('revokeGDPRConsent', () => {
    it('should revoke existing consent', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      const updatedPatient = patient.revokeGDPRConsent('consent-1');

      expect(updatedPatient.gdprConsents[0].granted).toBe(false);
      expect(updatedPatient.gdprConsents[0].revokedAt).toBeInstanceOf(Date);
      expect(updatedPatient.auditLog[1].action).toBe('updated');
    });

    it('should throw error if consent not found', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      expect(() => {
        patient.revokeGDPRConsent('non-existent-id');
      }).toThrow('GDPR consent not found');
    });
  });

  describe('hasActiveConsent', () => {
    it('should return true for active consent type', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      expect(patient.hasActiveConsent('data_processing')).toBe(true);
    });

    it('should return false for non-existent consent type', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      expect(patient.hasActiveConsent('gdt_export')).toBe(false);
    });

    it('should return false for revoked consent', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      const updatedPatient = patient.revokeGDPRConsent('consent-1');

      expect(updatedPatient.hasActiveConsent('data_processing')).toBe(false);
    });
  });

  describe('GDPR compliance', () => {
    it('should track all data access in audit log', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      // Simulate multiple operations
      let updatedPatient = patient.addGDPRConsent({
        ...mockConsents[0],
        id: 'consent-2',
        type: 'ocr_processing',
      });

      updatedPatient = updatedPatient.update(mockEncryptedData, 'en');
      updatedPatient = updatedPatient.revokeGDPRConsent('consent-2');

      expect(updatedPatient.auditLog.length).toBe(4);
      expect(updatedPatient.auditLog.map(log => log.action)).toEqual([
        'created',
        'updated',
        'updated',
        'updated',
      ]);
    });

    it('should ensure consent before data processing', () => {
      const patient = PatientEntity.create(
        mockEncryptedData,
        'de',
        mockConsents
      );

      expect(patient.hasActiveConsent('data_processing')).toBe(true);
      expect(patient.hasActiveConsent('gdt_export')).toBe(false);
    });
  });

  describe('language support', () => {
    it('should support all 19 languages', () => {
      const supportedLanguages = [
        'de', 'en', 'fr', 'es', 'it', 'tr', 'pl', 'ru',
        'ar', 'zh', 'pt', 'nl', 'uk', 'fa', 'ur', 'sq',
        'ro', 'hi', 'ja',
      ];

      supportedLanguages.forEach(lang => {
        const patient = PatientEntity.create(
          mockEncryptedData,
          lang,
          mockConsents
        );
        expect(patient.language).toBe(lang);
      });
    });
  });
});
