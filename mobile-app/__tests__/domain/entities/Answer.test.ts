import { AnswerEntity } from '@domain/entities/Answer';
import { EncryptedDataVO } from '@domain/value-objects/EncryptedData';

describe('AnswerEntity', () => {
  const mockEncryptedData = EncryptedDataVO.create({
    ciphertext: 'encrypted_value_123',
    iv: 'iv_123',
    authTag: 'tag_123',
    salt: 'salt_123',
  });

  describe('create', () => {
    it('should create answer entity with required fields', () => {
      const answer = AnswerEntity.create({
        questionnaireId: 'questionnaire_123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'manual',
      });

      expect(answer.id).toBeDefined();
      expect(answer.questionnaireId).toBe('questionnaire_123');
      expect(answer.questionId).toBe('q1');
      expect(answer.questionType).toBe('text');
      expect(answer.sourceType).toBe('manual');
      expect(answer.confidence).toBeUndefined();
      expect(answer.auditLog).toHaveLength(1);
      expect(answer.auditLog[0].action).toBe('created');
    });

    it('should create answer with AI-generated metadata', () => {
      const answer = AnswerEntity.create({
        questionnaireId: 'questionnaire_123',
        questionId: 'q2',
        encryptedValue: mockEncryptedData,
        questionType: 'textarea',
        sourceType: 'voice',
        confidence: 0.92,
      });

      expect(answer.sourceType).toBe('voice');
      expect(answer.confidence).toBe(0.92);
    });

    it('should throw error for invalid confidence', () => {
      expect(() =>
        AnswerEntity.create({
          questionnaireId: 'questionnaire_123',
          questionId: 'q3',
          encryptedValue: mockEncryptedData,
          questionType: 'text',
          sourceType: 'ocr',
          confidence: 1.5, // Invalid: > 1.0
        })
      ).toThrow();
    });
  });

  describe('update', () => {
    it('should update answer value and add audit log', () => {
      const answer = AnswerEntity.create({
        questionnaireId: 'questionnaire_123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'manual',
      });

      const newEncryptedData = EncryptedDataVO.create({
        ciphertext: 'new_encrypted_value',
        iv: 'new_iv',
        authTag: 'new_tag',
        salt: 'new_salt',
      });

      const updatedAnswer = answer.update(newEncryptedData);

      expect(updatedAnswer.encryptedValue).toEqual(newEncryptedData);
      expect(updatedAnswer.updatedAt.getTime()).toBeGreaterThan(
        answer.updatedAt.getTime()
      );
      expect(updatedAnswer.auditLog).toHaveLength(2);
      expect(updatedAnswer.auditLog[1].action).toBe('updated');
    });
  });

  describe('isAIGenerated', () => {
    it('should return true for voice/ocr answers', () => {
      const voiceAnswer = AnswerEntity.create({
        questionnaireId: 'q123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'voice',
        confidence: 0.85,
      });

      const ocrAnswer = AnswerEntity.create({
        questionnaireId: 'q123',
        questionId: 'q2',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'ocr',
        confidence: 0.90,
      });

      expect(voiceAnswer.isAIGenerated()).toBe(true);
      expect(ocrAnswer.isAIGenerated()).toBe(true);
    });

    it('should return false for manual answers', () => {
      const manualAnswer = AnswerEntity.create({
        questionnaireId: 'q123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'manual',
      });

      expect(manualAnswer.isAIGenerated()).toBe(false);
    });
  });

  describe('needsReview', () => {
    it('should return true for low confidence AI answers', () => {
      const lowConfidenceAnswer = AnswerEntity.create({
        questionnaireId: 'q123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'voice',
        confidence: 0.65,
      });

      expect(lowConfidenceAnswer.needsReview()).toBe(true);
    });

    it('should return false for high confidence AI answers', () => {
      const highConfidenceAnswer = AnswerEntity.create({
        questionnaireId: 'q123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'voice',
        confidence: 0.92,
      });

      expect(highConfidenceAnswer.needsReview()).toBe(false);
    });

    it('should return false for manual answers', () => {
      const manualAnswer = AnswerEntity.create({
        questionnaireId: 'q123',
        questionId: 'q1',
        encryptedValue: mockEncryptedData,
        questionType: 'text',
        sourceType: 'manual',
      });

      expect(manualAnswer.needsReview()).toBe(false);
    });
  });
});
