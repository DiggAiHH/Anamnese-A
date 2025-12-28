import { GDTExportVO } from '@domain/value-objects/GDTExport';

describe('GDTExportVO', () => {
  describe('create', () => {
    it('should create GDT export with required fields', () => {
      const gdtExport = GDTExportVO.create({
        version: '2.1',
        encoding: 'ISO-8859-1',
        records: [
          {
            id: '8000',
            length: '010',
            content: 'Test',
          },
        ],
      });

      expect(gdtExport.version).toBe('2.1');
      expect(gdtExport.encoding).toBe('ISO-8859-1');
      expect(gdtExport.records).toHaveLength(1);
    });
  });

  describe('buildRecord', () => {
    it('should format GDT record correctly', () => {
      const record = GDTExportVO.buildRecord('8000', 'Test Content');

      // Format: LLL IIII Content
      // LLL = 3-digit length (total length including LLL, space, IIII, space)
      // IIII = 4-digit field ID
      // Content = actual data
      expect(record).toMatch(/^\d{3} 8000 Test Content$/);
    });

    it('should calculate length correctly', () => {
      const record = GDTExportVO.buildRecord('8000', 'Test');
      const length = parseInt(record.substring(0, 3));

      // Length should include: 3 (LLL) + 1 (space) + 4 (IIII) + 1 (space) + content length
      expect(length).toBe(3 + 1 + 4 + 1 + 4); // = 13
    });

    it('should pad length with zeros', () => {
      const record = GDTExportVO.buildRecord('8000', 'A');
      
      expect(record.substring(0, 3)).toBe('009'); // 009 8000 A
    });
  });

  describe('buildHeader', () => {
    it('should build GDT header', () => {
      const header = GDTExportVO.buildHeader('2.1', '8000', 'ANAMNESE');

      expect(header).toContain('8000'); // Record type
      expect(header).toContain('9218'); // GDT version
      expect(header).toContain('2.1');
    });
  });

  describe('buildPatientRecord', () => {
    it('should build patient data record', () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1980-01-01',
        gender: 'male',
        insuranceNumber: '1234567890',
      };

      const record = GDTExportVO.buildPatientRecord(patientData);

      expect(record).toContain('3101'); // Last name
      expect(record).toContain('3102'); // First name
      expect(record).toContain('3103'); // Birth date
      expect(record).toContain('3110'); // Gender
    });

    it('should format birth date correctly', () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1980-01-15',
        gender: 'male',
      };

      const record = GDTExportVO.buildPatientRecord(patientData);

      // Birth date should be in DDMMYYYY format
      expect(record).toContain('15011980');
    });

    it('should convert gender to GDT codes', () => {
      const maleRecord = GDTExportVO.buildPatientRecord({
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1980-01-01',
        gender: 'male',
      });

      const femaleRecord = GDTExportVO.buildPatientRecord({
        firstName: 'Jane',
        lastName: 'Doe',
        birthDate: '1980-01-01',
        gender: 'female',
      });

      expect(maleRecord).toContain('3110'); // Gender field
      expect(maleRecord).toContain('M'); // Male code

      expect(femaleRecord).toContain('3110');
      expect(femaleRecord).toContain('W'); // Female code (Weiblich)
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate correct checksum', () => {
      const data = '0138000Test';
      const checksum = GDTExportVO.calculateChecksum(data);

      expect(checksum).toBeDefined();
      expect(checksum.length).toBe(4); // 4-digit checksum
    });

    it('should produce different checksums for different data', () => {
      const checksum1 = GDTExportVO.calculateChecksum('Test1');
      const checksum2 = GDTExportVO.calculateChecksum('Test2');

      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('toGDTString', () => {
    it('should generate complete GDT file content', () => {
      const gdtExport = GDTExportVO.create({
        version: '2.1',
        encoding: 'ISO-8859-1',
        records: [
          {
            id: '8000',
            length: '013',
            content: 'Test',
          },
        ],
      });

      const gdtString = gdtExport.toGDTString();

      expect(gdtString).toContain('8000'); // Record type
      expect(gdtString).toContain('Test');
      expect(gdtString).toContain('\r\n'); // Windows line endings
    });
  });

  describe('validate', () => {
    it('should validate correct GDT data', () => {
      const gdtExport = GDTExportVO.create({
        version: '2.1',
        encoding: 'ISO-8859-1',
        records: [
          {
            id: '8000',
            length: '013',
            content: 'Test',
          },
        ],
      });

      expect(() => gdtExport.validate()).not.toThrow();
    });

    it('should reject invalid version', () => {
      expect(() =>
        GDTExportVO.create({
          version: '999',
          encoding: 'ISO-8859-1',
          records: [],
        })
      ).toThrow();
    });

    it('should reject empty records', () => {
      expect(() =>
        GDTExportVO.create({
          version: '2.1',
          encoding: 'ISO-8859-1',
          records: [],
        })
      ).toThrow();
    });
  });
});
