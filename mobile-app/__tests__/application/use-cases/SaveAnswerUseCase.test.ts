import { SaveAnswerUseCase } from '@application/use-cases/SaveAnswerUseCase';
import { IAnswerRepository } from '@domain/repositories/IAnswerRepository';
import { IEncryptionService } from '@domain/repositories/IEncryptionService';
import { AnswerEntity } from '@domain/entities/Answer';
import { EncryptedDataVO } from '@domain/value-objects/EncryptedData';

// Mock implementations
class MockAnswerRepository implements IAnswerRepository {
  private answers: AnswerEntity[] = [];

  async save(answer: AnswerEntity): Promise<void> {
    this.answers.push(answer);
  }

  async findById(id: string): Promise<AnswerEntity | null> {
    return this.answers.find((a) => a.id === id) || null;
  }

  async findByQuestionnaireId(questionnaireId: string): Promise<AnswerEntity[]> {
    return this.answers.filter((a) => a.questionnaireId === questionnaireId);
  }

  async findByQuestionId(
    questionnaireId: string,
    questionId: string
  ): Promise<AnswerEntity | null> {
    return (
      this.answers.find(
        (a) => a.questionnaireId === questionnaireId && a.questionId === questionId
      ) || null
    );
  }

  async delete(id: string): Promise<void> {
    this.answers = this.answers.filter((a) => a.id !== id);
  }

  async deleteByQuestionnaireId(questionnaireId: string): Promise<void> {
    this.answers = this.answers.filter((a) => a.questionnaireId !== questionnaireId);
  }

  async saveBatch(answers: AnswerEntity[]): Promise<void> {
    this.answers.push(...answers);
  }

  async getDecryptedAnswersMap(
    questionnaireId: string,
    encryptionKey: string
  ): Promise<Map<string, any>> {
    return new Map();
  }
}

class MockEncryptionService implements IEncryptionService {
  async deriveKey(masterPassword: string): Promise<string> {
    return `derived_${masterPassword}`;
  }

  async hashPassword(password: string): Promise<string> {
    return `hash_${password}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return hash === `hash_${password}`;
  }

  async encrypt(data: string, key: string): Promise<EncryptedDataVO> {
    return EncryptedDataVO.create({
      ciphertext: `encrypted_${data}`,
      iv: 'mock_iv',
      authTag: 'mock_tag',
      salt: 'mock_salt',
    });
  }

  async decrypt(encryptedData: EncryptedDataVO, key: string): Promise<string> {
    return encryptedData.ciphertext.replace('encrypted_', '');
  }

  async generateSecureRandom(byteLength: number): Promise<string> {
    return 'random_bytes';
  }
}

describe('SaveAnswerUseCase', () => {
  let useCase: SaveAnswerUseCase;
  let mockRepository: MockAnswerRepository;
  let mockEncryption: MockEncryptionService;

  beforeEach(() => {
    mockRepository = new MockAnswerRepository();
    mockEncryption = new MockEncryptionService();
    useCase = new SaveAnswerUseCase(mockRepository, mockEncryption);
  });

  describe('execute', () => {
    it('should save answer successfully', async () => {
      const input = {
        questionnaireId: 'q123',
        question: {
          id: 'first_name',
          labelKey: 'questions.firstName.label',
          type: 'text' as const,
          required: true,
          validation: { minLength: 2, maxLength: 50 },
        },
        value: 'John Doe',
        encryptionKey: 'test_key',
        sourceType: 'manual' as const,
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.answerId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should fail for invalid required field', async () => {
      const input = {
        questionnaireId: 'q123',
        question: {
          id: 'first_name',
          labelKey: 'questions.firstName.label',
          type: 'text' as const,
          required: true,
          validation: { minLength: 2, maxLength: 50 },
        },
        value: null,
        encryptionKey: 'test_key',
        sourceType: 'manual' as const,
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('required');
    });

    it('should fail for too short text', async () => {
      const input = {
        questionnaireId: 'q123',
        question: {
          id: 'first_name',
          labelKey: 'questions.firstName.label',
          type: 'text' as const,
          required: true,
          validation: { minLength: 2, maxLength: 50 },
        },
        value: 'A',
        encryptionKey: 'test_key',
        sourceType: 'manual' as const,
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should save answer with AI metadata', async () => {
      const input = {
        questionnaireId: 'q123',
        question: {
          id: 'complaint',
          labelKey: 'questions.complaint.label',
          type: 'textarea' as const,
          required: true,
        },
        value: 'Chest pain since yesterday',
        encryptionKey: 'test_key',
        sourceType: 'voice' as const,
        confidence: 0.92,
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.answerId).toBeDefined();

      const savedAnswer = await mockRepository.findById(result.answerId!);
      expect(savedAnswer).toBeDefined();
      expect(savedAnswer!.sourceType).toBe('voice');
      expect(savedAnswer!.confidence).toBe(0.92);
    });

    it('should update existing answer', async () => {
      // First save
      const input1 = {
        questionnaireId: 'q123',
        question: {
          id: 'first_name',
          labelKey: 'questions.firstName.label',
          type: 'text' as const,
          required: true,
        },
        value: 'John',
        encryptionKey: 'test_key',
        sourceType: 'manual' as const,
      };

      const result1 = await useCase.execute(input1);
      expect(result1.success).toBe(true);

      // Update
      const input2 = {
        ...input1,
        value: 'John Doe',
      };

      const result2 = await useCase.execute(input2);
      expect(result2.success).toBe(true);

      const answers = await mockRepository.findByQuestionnaireId('q123');
      expect(answers.length).toBe(2); // Both versions saved (no update, only insert)
    });
  });
});
