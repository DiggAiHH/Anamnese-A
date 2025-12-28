import { QuestionnaireEntity, QuestionType, ConditionalOperator } from '../Questionnaire';

describe('QuestionnaireEntity', () => {
  const mockSections = [
    {
      id: 'personal_data',
      titleKey: 'sections.personal_data.title',
      descriptionKey: 'sections.personal_data.description',
      order: 1,
      questions: [
        {
          id: 'first_name',
          type: 'text' as QuestionType,
          labelKey: 'questions.first_name.label',
          placeholderKey: 'questions.first_name.placeholder',
          required: true,
          order: 1,
          validation: {
            minLength: 2,
            maxLength: 50,
          },
        },
        {
          id: 'gender',
          type: 'radio' as QuestionType,
          labelKey: 'questions.gender.label',
          required: true,
          order: 2,
          options: [
            { value: 'male', labelKey: 'questions.gender.options.male' },
            { value: 'female', labelKey: 'questions.gender.options.female' },
            { value: 'other', labelKey: 'questions.gender.options.other' },
          ],
        },
      ],
    },
    {
      id: 'womens_health',
      titleKey: 'sections.womens_health.title',
      order: 2,
      questions: [
        {
          id: 'pregnancy',
          type: 'radio' as QuestionType,
          labelKey: 'questions.pregnancy.label',
          required: true,
          order: 1,
          conditions: [
            {
              questionId: 'gender',
              operator: 'equals' as ConditionalOperator,
              value: 'female',
            },
          ],
          options: [
            { value: 'yes', labelKey: 'common.yes' },
            { value: 'no', labelKey: 'common.no' },
          ],
        },
      ],
    },
  ];

  describe('create', () => {
    it('should create a new questionnaire with valid data', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      expect(questionnaire.id).toBeDefined();
      expect(questionnaire.patientId).toBe('patient-123');
      expect(questionnaire.version).toBe('1.0.0');
      expect(questionnaire.sections).toHaveLength(2);
      expect(questionnaire.status).toBe('draft');
      expect(questionnaire.createdAt).toBeInstanceOf(Date);
      expect(questionnaire.completedAt).toBeNull();
    });

    it('should throw error if sections array is empty', () => {
      expect(() => {
        QuestionnaireEntity.create('patient-123', [], '1.0.0');
      }).toThrow('Questionnaire must have at least one section');
    });

    it('should sort sections by order', () => {
      const unorderedSections = [
        { ...mockSections[1], order: 3 },
        { ...mockSections[0], order: 1 },
      ];

      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        unorderedSections,
        '1.0.0'
      );

      expect(questionnaire.sections[0].order).toBe(1);
      expect(questionnaire.sections[1].order).toBe(3);
    });
  });

  describe('updateStatus', () => {
    it('should update status to in_progress', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const updated = questionnaire.updateStatus('in_progress');

      expect(updated.status).toBe('in_progress');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(questionnaire.updatedAt.getTime());
    });

    it('should update status to completed and set completedAt', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const updated = questionnaire.updateStatus('completed');

      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeInstanceOf(Date);
    });

    it('should maintain immutability', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      questionnaire.updateStatus('completed');

      expect(questionnaire.status).toBe('draft');
      expect(questionnaire.completedAt).toBeNull();
    });
  });

  describe('getVisibleQuestions', () => {
    it('should return all questions when no answers provided', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const visible = questionnaire.getVisibleQuestions(new Map());

      // Only questions without conditions should be visible
      expect(visible.length).toBe(2); // first_name, gender
      expect(visible.map(q => q.id)).toEqual(['first_name', 'gender']);
    });

    it('should show conditional question when condition is met', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const answers = new Map([['gender', 'female']]);

      const visible = questionnaire.getVisibleQuestions(answers);

      expect(visible.length).toBe(3); // first_name, gender, pregnancy
      expect(visible.map(q => q.id)).toContain('pregnancy');
    });

    it('should hide conditional question when condition is not met', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const answers = new Map([['gender', 'male']]);

      const visible = questionnaire.getVisibleQuestions(answers);

      expect(visible.length).toBe(2); // first_name, gender
      expect(visible.map(q => q.id)).not.toContain('pregnancy');
    });
  });

  describe('evaluateConditions', () => {
    const testQuestion = mockSections[1].questions[0]; // pregnancy question

    it('should evaluate equals operator correctly', () => {
      const answers = new Map([['gender', 'female']]);
      const result = QuestionnaireEntity.evaluateConditions(testQuestion, answers);
      expect(result).toBe(true);
    });

    it('should return false when answer does not match', () => {
      const answers = new Map([['gender', 'male']]);
      const result = QuestionnaireEntity.evaluateConditions(testQuestion, answers);
      expect(result).toBe(false);
    });

    it('should return false when answer is missing', () => {
      const answers = new Map();
      const result = QuestionnaireEntity.evaluateConditions(testQuestion, answers);
      expect(result).toBe(false);
    });

    it('should handle contains operator', () => {
      const question = {
        ...testQuestion,
        conditions: [
          {
            questionId: 'symptoms',
            operator: 'contains' as ConditionalOperator,
            value: 'fever',
          },
        ],
      };

      const answers = new Map([['symptoms', ['fever', 'cough']]]);
      const result = QuestionnaireEntity.evaluateConditions(question, answers);
      expect(result).toBe(true);
    });

    it('should handle notEquals operator', () => {
      const question = {
        ...testQuestion,
        conditions: [
          {
            questionId: 'gender',
            operator: 'notEquals' as ConditionalOperator,
            value: 'male',
          },
        ],
      };

      const answers = new Map([['gender', 'female']]);
      const result = QuestionnaireEntity.evaluateConditions(question, answers);
      expect(result).toBe(true);
    });

    it('should handle greater operator', () => {
      const question = {
        ...testQuestion,
        conditions: [
          {
            questionId: 'age',
            operator: 'greater' as ConditionalOperator,
            value: 18,
          },
        ],
      };

      const answers = new Map([['age', 25]]);
      const result = QuestionnaireEntity.evaluateConditions(question, answers);
      expect(result).toBe(true);
    });

    it('should handle less operator', () => {
      const question = {
        ...testQuestion,
        conditions: [
          {
            questionId: 'age',
            operator: 'less' as ConditionalOperator,
            value: 65,
          },
        ],
      };

      const answers = new Map([['age', 30]]);
      const result = QuestionnaireEntity.evaluateConditions(question, answers);
      expect(result).toBe(true);
    });

    it('should handle multiple conditions (AND logic)', () => {
      const question = {
        ...testQuestion,
        conditions: [
          {
            questionId: 'gender',
            operator: 'equals' as ConditionalOperator,
            value: 'female',
          },
          {
            questionId: 'age',
            operator: 'greater' as ConditionalOperator,
            value: 18,
          },
        ],
      };

      const answers = new Map([
        ['gender', 'female'],
        ['age', 25],
      ]);
      const result = QuestionnaireEntity.evaluateConditions(question, answers);
      expect(result).toBe(true);
    });

    it('should return false if any condition fails (AND logic)', () => {
      const question = {
        ...testQuestion,
        conditions: [
          {
            questionId: 'gender',
            operator: 'equals' as ConditionalOperator,
            value: 'female',
          },
          {
            questionId: 'age',
            operator: 'greater' as ConditionalOperator,
            value: 18,
          },
        ],
      };

      const answers = new Map([
        ['gender', 'female'],
        ['age', 16], // Fails second condition
      ]);
      const result = QuestionnaireEntity.evaluateConditions(question, answers);
      expect(result).toBe(false);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate 0% progress with no answers', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const progress = questionnaire.calculateProgress(new Map());

      expect(progress).toBe(0);
    });

    it('should calculate 50% progress with half answers', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const answers = new Map([['first_name', 'John']]);

      const progress = questionnaire.calculateProgress(answers);

      expect(progress).toBe(50); // 1 out of 2 visible questions
    });

    it('should calculate 100% progress with all visible questions answered', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      const answers = new Map([
        ['first_name', 'John'],
        ['gender', 'male'],
      ]);

      const progress = questionnaire.calculateProgress(answers);

      expect(progress).toBe(100);
    });

    it('should only count visible questions in progress', () => {
      const questionnaire = QuestionnaireEntity.create(
        'patient-123',
        mockSections,
        '1.0.0'
      );

      // Answer gender as male, pregnancy question becomes invisible
      const answers = new Map([
        ['first_name', 'John'],
        ['gender', 'male'],
        ['pregnancy', 'yes'], // Should not count as it's not visible
      ]);

      const progress = questionnaire.calculateProgress(answers);

      expect(progress).toBe(100); // 2 out of 2 visible questions
    });
  });
});
