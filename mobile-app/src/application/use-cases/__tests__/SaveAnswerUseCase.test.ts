import { SaveAnswerUseCase } from '../SaveAnswerUseCase';
import { IAnswerRepository } from '../../../domain/repositories/IAnswerRepository';
import { IEncryptionService } from '../../../domain/repositories/IEncryptionService';
import { AnswerEntity, AnswerValue, AnswerSourceType } from '../../../domain/entities/Answer';
import { EncryptedDataVO } from '../../../domain/value-objects/EncryptedData';
import { QuestionType } from '../../../domain/entities/Questionnaire';

// Mock implementations
class MockAnswerRepository implements IAnswerRepository {
  private answers: AnswerEntity[] = [];

  async save(answer: AnswerEntity): Promise<void> {
    const index = this.answers.findIndex(a => a.id === answer.id);
    if (index >= 0) {
      this.answers[index] = answer;
    } else {
      this.answers.push(answer);
    }
  }

  async findById(id: string): Promise<AnswerEntity | null> {
    return this.answers.find(a => a.id === id) || null;
  }

  async findByQuestionnaireId(questionnaireId: string): Promise<AnswerEntity[]> {
    return this.answers.filter(a => a.questionnaireId === questionnaireId);
  }

  async findByQuestionId(
    questionnaireId: string,
    questionId: string
  ): Promise<AnswerEntity | null> {
    return (
      this.answers.find(
        a => a.questionnaireId === questionnaireId && a.questionId === questionId
      ) || null
    );
  }

  async delete(id: string): Promise<void> {
    this.answers = this.answers.filter(a => a.id !== id);
  }

  async deleteByQuestionnaireId(questionnaireId: string): Promise<void> {
    this.answers = this.answers.filter(a => a.questionnaireId !== questionnaireId);
  }

  // Helper for tests
  getAllAnswers(): AnswerEntity[] {
    return this.answers;
  }

  clear(): void {
    this.answers = [];
  }
}

class MockEncryptionService implements IEncryptionService {
  async encrypt(data: string, key: Buffer): Promise<EncryptedDataVO> {
    // Mock encryption - just encode
    const encoded = Buffer.from(data).toString('base64');
    return new EncryptedDataVO(
      encoded,
      'mock-iv',
      'mock-auth-tag',
      'mock-salt'
    );
  }

  async decrypt(encryptedData: EncryptedDataVO, key: Buffer): Promise<string> {
    // Mock decryption - just decode
    return Buffer.from(encryptedData.ciphertext, 'base64').toString();
  }

  async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return Buffer.from(password);
  }

  async hashPassword(password: string): Promise<string> {
    return `hashed_${password}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return hash === `hashed_${password}`;
  }

  generateRandomBytes(length: number): Buffer {
    return Buffer.alloc(length, 0);
  }
}

describe('SaveAnswerUseCase', () => {
  let useCase: SaveAnswerUseCase;
  let mockRepository: MockAnswerRepository;
  let mockEncryption: MockEncryptionService;
  const mockEncryptionKey = Buffer.from('test-key');

  beforeEach(() => {
    mockRepository = new MockAnswerRepository();
    mockEncryption = new MockEncryptionService();
    useCase = new SaveAnswerUseCase(mockRepository, mockEncryption);
  });

  afterEach(() => {
    mockRepository.clear();
  });
pppppppppppptpppppppppppptèèèèèèeèèèèèewèèsèèèèèeèèèèeèpppppppppppptpppppppppppptèèèèèèeèèèèèewèèsèèèèèeèèèèeèdèeèèèèeèpppppppppppptpppppppppppptèèèèèèeèèèèèewèèsèèèèèeèèèèeèdsèèèèèeèpppppppppppptpppppppppppptèèèèèèeèèèèèewèèsèèèèèeèèèèeèdsèddèèeèpppppppppppptpppppppppppptèèèèèèeèèèèèewèèsèèèèèeèèèèeèdsèdddèeèpppppppppppptpppppppppppptèèèèèèeèèèèèewèèsèèèèèeèèèèeèdsèdddè