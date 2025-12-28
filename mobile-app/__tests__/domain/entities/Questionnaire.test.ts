import { QuestionnaireEntity, QuestionType } from '@domain/entities/Questionnaire';

describe('QuestionnaireEntity', () => {
  const mockSections = [
    {
      id: 'personal_data',
      titleKey: 'sections.personalData.title',
      questions: [
        {
          id: 'first_name',
          labelKey: 'questions.firstName.label',
          type: 'text' as QuestionType,
          required: true,
          validation: { minLength: 2, maxLength: 50 },
        },
        {
          id: 'gender',
          labelKey: 'questions.gender.label',
          type: 'radio' as QuestionType,
          required: true,
          options: [
            { value: 'male', labelKey: 'options.male' },
            { value: 'female', labelKey: 'options.female' },
          ],
        },
      ],
    },
    {
      id: 'womens_health',
      titleKey: 'sections.womensHealth.title',
      questions: [
        {
          id: 'is_pregnant',
          labelKey: 'questions.isPregnant.label',
          type: 'radio' as QuestionType,
          required: false,
          conditions: [
            {
              questionId: 'gender',
              operator: 'equals' as const,
              value: 'female',
            },
          ],
        },
      ],
    },
  ];

  describe('create', () => {
    it('should create questionnaire entity', () => {
      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: mockSections,
      });

      expect(questionnaire.id).toBeDefined();
      expect(questionnaire.patientId).toBe('patient_123');
      expect(questionnaire.version).toBe('1.0.0');
      expect(questionnaire.status).toBe('draft');
      expect(questionnaire.sections).toEqual(mockSections);
    });
  });

  describe('evaluateConditions', () => {
    it('should show questions when conditions are met', () => {
      const answers = new Map([['gender', 'female']]);

      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: mockSections,
      });

      const visibleQuestions = questionnaire.getVisibleQuestions(answers);
      const pregnantQuestion = visibleQuestions.find((q) => q.id === 'is_pregnant');

      expect(pregnantQuestion).toBeDefined();
    });

    it('should hide questions when conditions are not met', () => {
      const answers = new Map([['gender', 'male']]);

      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: mockSections,
      });

      const visibleQuestions = questionnaire.getVisibleQuestions(answers);
      const pregnantQuestion = visibleQuestions.find((q) => q.id === 'is_pregnant');

      expect(pregnantQuestion).toBeUndefined();
    });

    it('should handle contains operator', () => {
      const sectionsWithContains = [
        {
          id: 'medical_history',
          titleKey: 'sections.medicalHistory.title',
          questions: [
            {
              id: 'chronic_diseases',
              labelKey: 'questions.chronicDiseases.label',
              type: 'checkbox' as QuestionType,
              required: false,
              options: [
                { value: 'diabetes', labelKey: 'options.diabetes' },
                { value: 'hypertension', labelKey: 'options.hypertension' },
              ],
            },
            {
              id: 'diabetes_type',
              labelKey: 'questions.diabetesType.label',
              type: 'radio' as QuestionType,
              required: false,
              conditions: [
                {
                  questionId: 'chronic_diseases',
                  operator: 'contains' as const,
                  value: 'diabetes',
                },
              ],
            },
          ],
        },
      ];

      const answers = new Map([['chronic_diseases', ['diabetes', 'hypertension']]]);

      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: sectionsWithContains,
      });

      const visibleQuestions = questionnaire.getVisibleQuestions(answers);
      const diabetesTypeQuestion = visibleQuestions.find((q) => q.id === 'diabetes_type');

      expect(diabetesTypeQuestion).toBeDefined();
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress based on answered required questions', () => {
      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: mockSections,
      });

      const answers = new Map([
        ['first_name', 'John'],
        ['gender', 'male'],
      ]);

      const progress = questionnaire.calculateProgress(answers);
      expect(progress).toBe(100); // Both required questions answered
    });

    it('should return 0 for empty answers', () => {
      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: mockSections,
      });

      const answers = new Map();
      const progress = questionnaire.calculateProgress(answers);

      expect(progress).toBe(0);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark questionnaire as completed', () => {
      const questionnaire = QuestionnaireEntity.create({
        patientId: 'patient_123',
        version: '1.0.0',
        sections: mockSections,
      });

      const completedQuestionnaire = questionnaire.markAsCompleted();

      expect(completedQuestionnaire.status).toBe('completed');
      expect(completedQuestionnaire.completedAt).toBeDefined();
      expect(completedQuestionnaire.auditLog).toHaveLength(2);
      expect(completedQuestionnaire.auditLog[1].action).toBe('completed');
    });
  });
});
