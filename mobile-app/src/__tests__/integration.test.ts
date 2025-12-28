import { SaveAnswerUseCase } from '../application/use-cases/SaveAnswerUseCase';
import { LoadQuestionnaireUseCase } from '../application/use-cases/LoadQuestionnaireUseCase';
import { CreatePatientUseCase } from '../application/use-cases/CreatePatientUseCase';
import { DatabaseConnection } from '../infrastructure/persistence/DatabaseConnection';
import { SQLitePatientRepository } from '../infrastructure/persistence/SQLitePatientRepository';
import { SQLiteQuestionnaireRepository } from '../infrastructure/persistence/SQLiteQuestionnaireRepository';
import { SQLiteAnswerRepository } from '../infrastructure/persistence/SQLiteAnswerRepository';
import { NativeEncryptionService } from '../infrastructure/encryption/NativeEncryptionService';
import { QuestionType } from '../domain/entities/Questionnaire';

describe('Integration Tests - Questionnaire Flow', () => {
  let database: DatabaseConnection;
  let patientRepository: SQLitePatientRepository;
  let questionnaireRepository: SQLiteQuestionnaireRepository;
  let answerRepository: SQLiteAnswerRepository;
  let encryptionService: NativeEncryptionService;
  
  let createPatientUseCase: CreatePatientUseCase;
  let loadQuestionnaireUseCase: LoadQuestionnaireUseCase;
  let saveAnswerUseCase: SaveAnswerUseCase;
  
  let encryptionKey: Buffer;

  beforeAll(async () => {
    // Initialize database
    database = new DatabaseConnection(':memory:');
    await database.connect();

    // Initialize repositories
    patientRepository = new SQLitePatientRepository(database);
    questionnaireRepository = new SQLiteQuestionnaireRepository(database);
    answerRepository = new SQLiteAnswerRepository(database);
    encryptionService = new NativeEncryptionService();

    // Initialize use cases
    createPatientUseCase = new CreatePatientUseCase(
      patientRepository,
      encryptionService
    );
    loadQuestionnaireUseCase = new LoadQuestionnaireUseCase(
      questionnaireRepository,
      answerRepository,
      encryptionService
    );
    saveAnswerUseCase = new SaveAnswerUseCase(
      answerRepository,
      encryptionService
    );

    // Generate encryption key
    encryptionKey = await encryptionService.deriveKey(
      'TestMasterPassword123!',
      Buffer.from('test-salt-123456')
    );
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await database.execute('DELETE FROM gdpr_consents');
    await database.execute('DELETE FROM answers');
    await database.execute('DELETE FROM documents');
    await database.execute('DELETE FROM questionnaires');
    await database.execute('DELETE FROM patients');
  });

  describe('Complete Anamnesis Flow', () => {
    it('should complete full patient journey: create → answer questions → save', async () => {
      // Step 1: Create Patient
      const createPatientResult = await createPatientUseCase.execute({
        patientData: {
          firstName: 'Max',
          lastName: 'Mustermann',
          birthDate: '1990-05-15',
          gender: 'male',
          email: 'max@example.com',
          phone: '+49123456789',
        },
        language: 'de',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Medizinische Datenerfassung',
          },
        ],
      });

      expect(createPatientResult.success).toBe(true);
      expect(createPatientResult.patient).toBeDefined();

      const patientId = createPatientResult.patient!.id;

      // Step 2: Load Questionnaire
      const loadQuestionnaireResult = await loadQuestionnaireUseCase.execute({
        patientId,
        encryptionKey,
      });

      expect(loadQuestionnaireResult.success).toBe(true);
      expect(loadQuestionnaireResult.questionnaire).toBeDefined();

      const questionnaireId = loadQuestionnaireResult.questionnaire!.id;
      const firstQuestion = loadQuestionnaireResult.questionnaire!.sections[0].questions[0];

      // Step 3: Answer First Question
      const saveAnswerResult = await saveAnswerUseCase.execute({
        questionnaireId,
        question: firstQuestion,
        value: 'Max',
        encryptionKey,
      });

      expect(saveAnswerResult.success).toBe(true);
      expect(saveAnswerResult.answer).toBeDefined();

      // Step 4: Reload Questionnaire (should have answer)
      const reloadResult = await loadQuestionnaireUseCase.execute({
        patientId,
        encryptionKey,
      });

      expect(reloadResult.success).toBe(true);
      expect(reloadResult.decryptedAnswers).toBeDefined();
      expect(reloadResult.decryptedAnswers!.get(firstQuestion.id)).toBe('Max');
    });

    it('should handle conditional logic: show/hide questions based on answers', async () => {
      // Create patient
      const createPatientResult = await createPatientUseCase.execute({
        patientData: {
          firstName: 'Maria',
          lastName: 'Schmidt',
          birthDate: '1985-03-20',
          gender: 'female',
          email: 'maria@example.com',
        },
        language: 'de',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Medical data processing',
          },
        ],
      });

      const patientId = createPatientResult.patient!.id;

      // Load questionnaire
      const loadResult = await loadQuestionnaireUseCase.execute({
        patientId,
        encryptionKey,
      });

      const questionnaire = loadResult.questionnaire!;
      const questionnaireId = questionnaire.id;

      // Find gender question
      const genderQuestion = questionnaire.sections
        .flatMap(s => s.questions)
        .find(q => q.id === 'gender');

      expect(genderQuestion).toBeDefined();

      // Initial visible questions (no answers yet)
      const initialVisible = questionnaire.getVisibleQuestions(new Map());
      const hasPregnancyQuestion = initialVisible.some(q => q.id === 'pregnancy');
      
      // Pregnancy question should NOT be visible initially
      expect(hasPregnancyQuestion).toBe(false);

      // Answer gender = female
      await saveAnswerUseCase.execute({
        questionnaireId,
        question: genderQuestion!,
        value: 'female',
        encryptionKey,
      });

      // Reload questionnaire
      const reloadResult = await loadQuestionnaireUseCase.execute({
        patientId,
        encryptionKey,
      });

      const answers = reloadResult.decryptedAnswers!;
      const updatedQuestionnaire = reloadResult.questionnaire!;

      // Now pregnancy question SHOULD be visible
      const updatedVisible = updatedQuestionnaire.getVisibleQuestions(answers);
      const nowHasPregnancy = updatedVisible.some(q => q.id === 'pregnancy');

      expect(nowHasPregnancy).toBe(true);
    });

    it('should calculate progress correctly', async () => {
      // Create patient
      const createResult = await createPatientUseCase.execute({
        patientData: {
          firstName: 'Test',
          lastName: 'User',
          birthDate: '2000-01-01',
          gender: 'male',
        },
        language: 'en',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Testing',
          },
        ],
      });

      const patientId = createResult.patient!.id;

      // Load questionnaire
      const loadResult = await loadQuestionnaireUseCase.execute({
        patientId,
        encryptionKey,
      });

      const questionnaire = loadResult.questionnaire!;
      const questionnaireId = questionnaire.id;

      // Initial progress should be 0%
      const initialProgress = questionnaire.calculateProgress(new Map());
      expect(initialProgress).toBe(0);

      // Get visible questions
      const visibleQuestions = questionnaire.getVisibleQuestions(new Map());
      const totalQuestions = visibleQuestions.length;

      // Answer half the questions
      const halfQuestions = visibleQuestions.slice(0, Math.floor(totalQuestions / 2));

      for (const question of halfQuestions) {
        await saveAnswerUseCase.execute({
          questionnaireId,
          question,
          value: 'test-answer',
          encryptionKey,
        });
      }

      // Reload and check progress
      const reloadResult = await loadQuestionnaireUseCase.execute({
        patientId,
        encryptionKey,
      });

      const answers = reloadResult.decryptedAnswers!;
      const progress = reloadResult.questionnaire!.calculateProgress(answers);

      // Progress should be approximately 50%
      expect(progress).toBeGreaterThan(40);
      expect(progress).toBeLessThan(60);
    });
  });

  describe('Data Encryption & Decryption', () => {
    it('should encrypt patient data and decrypt correctly', async () => {
      const patientData = {
        firstName: 'Sensitive',
        lastName: 'Data',
        birthDate: '1980-12-25',
        gender: 'other',
        email: 'sensitive@example.com',
        phone: '+49987654321',
        address: '123 Secret Street',
        insuranceNumber: 'INS-123456',
      };

      const createResult = await createPatientUseCase.execute({
        patientData,
        language: 'de',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Testing encryption',
          },
        ],
      });

      expect(createResult.success).toBe(true);

      const patientId = createResult.patient!.id;

      // Retrieve patient from database
      const retrievedPatient = await patientRepository.findById(patientId);

      expect(retrievedPatient).toBeDefined();
      expect(retrievedPatient!.encryptedData).toBeDefined();

      // Encrypted data should NOT contain plaintext
      const encryptedString = JSON.stringify(retrievedPatient!.encryptedData);
      expect(encryptedString).not.toContain('Sensitive');
      expect(encryptedString).not.toContain('Data');
      expect(encryptedString).not.toContain('sensitive@example.com');

      // Decrypt and verify
      const decryptedJson = await encryptionService.decrypt(
        retrievedPatient!.encryptedData,
        encryptionKey
      );

      const decryptedData = JSON.parse(decryptedJson);

      expect(decryptedData.firstName).toBe('Sensitive');
      expect(decryptedData.lastName).toBe('Data');
      expect(decryptedData.email).toBe('sensitive@example.com');
    });

    it('should fail decryption with wrong key', async () => {
      const createResult = await createPatientUseCase.execute({
        patientData: {
          firstName: 'Test',
          lastName: 'User',
          birthDate: '1990-01-01',
          gender: 'male',
        },
        language: 'de',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Testing',
          },
        ],
      });

      const patientId = createResult.patient!.id;
      const retrievedPatient = await patientRepository.findById(patientId);

      // Try to decrypt with wrong key
      const wrongKey = await encryptionService.deriveKey(
        'WrongPassword',
        Buffer.from('wrong-salt-123456')
      );

      await expect(
        encryptionService.decrypt(retrievedPatient!.encryptedData, wrongKey)
      ).rejects.toThrow();
    });
  });

  describe('GDPR Compliance', () => {
    it('should track all data operations in audit log', async () => {
      const createResult = await createPatientUseCase.execute({
        patientData: {
          firstName: 'Audit',
          lastName: 'Test',
          birthDate: '1995-06-10',
          gender: 'male',
        },
        language: 'de',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Audit testing',
          },
        ],
      });

      const patient = createResult.patient!;

      expect(patient.auditLog.length).toBeGreaterThan(0);
      expect(patient.auditLog[0].action).toBe('created');
      expect(patient.auditLog[0].timestamp).toBeInstanceOf(Date);
    });

    it('should enforce consent before data processing', async () => {
      // Try to create patient without consents
      await expect(
        createPatientUseCase.execute({
          patientData: {
            firstName: 'No',
            lastName: 'Consent',
            birthDate: '1990-01-01',
            gender: 'male',
          },
          language: 'de',
          encryptionKey,
          consents: [], // No consents!
        })
      ).rejects.toThrow();
    });

    it('should allow patient data deletion', async () => {
      const createResult = await createPatientUseCase.execute({
        patientData: {
          firstName: 'Delete',
          lastName: 'Me',
          birthDate: '1990-01-01',
          gender: 'male',
        },
        language: 'de',
        encryptionKey,
        consents: [
          {
            type: 'data_processing',
            granted: true,
            privacyPolicyVersion: '1.0.0',
            purpose: 'Testing deletion',
          },
        ],
      });

      const patientId = createResult.patient!.id;

      // Delete patient
      await patientRepository.delete(patientId);

      // Verify deletion
      const retrievedPatient = await patientRepository.findById(patientId);
      expect(retrievedPatient).toBeNull();
    });
  });

  describe('Multi-Language Support', () => {
    it('should support all 19 languages', async () => {
      const languages = [
        'de', 'en', 'fr', 'es', 'it', 'tr', 'pl', 'ru',
        'ar', 'zh', 'pt', 'nl', 'uk', 'fa', 'ur', 'sq',
        'ro', 'hi', 'ja',
      ];

      for (const language of languages) {
        const createResult = await createPatientUseCase.execute({
          patientData: {
            firstName: `Test-${language}`,
            lastName: 'User',
            birthDate: '1990-01-01',
            gender: 'male',
          },
          language,
          encryptionKey,
          consents: [
            {
              type: 'data_processing',
              granted: true,
              privacyPolicyVersion: '1.0.0',
              purpose: `Testing ${language}`,
            },
          ],
        });

        expect(createResult.success).toBe(true);
        expect(createResult.patient!.language).toBe(language);
      }
    });
  });
});
