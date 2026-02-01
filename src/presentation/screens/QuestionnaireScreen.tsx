/**
 * QuestionnaireScreen - Hauptbildschirm für Fragebogen
 * 
 * VOLLSTÄNDIGER DATENFLUSS:
 * 
 * 1. User öffnet Screen
 *    ↓
 * 2. LoadQuestionnaireUseCase lädt Questionnaire + Answers
 *    ↓
 * 3. Store wird aktualisiert (setQuestionnaire, setAnswers)
 *    ↓
 * 4. Component rendert aktuelle Sektion mit Fragen
 *    ↓
 * 5. User beantwortet Frage (QuestionCard)
 *    ↓
 * 6. onValueChange → Store.setAnswer
 *    ↓
 * 7. SaveAnswerUseCase speichert verschlüsselt in DB
 *    ↓
 * 8. Conditional Logic evaluated (getVisibleQuestions)
 *    ↓
 * 9. UI updated automatisch (Zustand)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { QuestionCard } from '../components/QuestionCard';
import { useQuestionnaireStore, selectCurrentSection, selectVisibleQuestions, selectProgress } from '../state/useQuestionnaireStore';
import { AnswerValue } from '@domain/entities/Answer';
import { useTranslation } from 'react-i18next';

// Use Cases
import { LoadQuestionnaireUseCase } from '@application/use-cases/LoadQuestionnaireUseCase';
import { SaveAnswerUseCase } from '@application/use-cases/SaveAnswerUseCase';

// Repositories (DI - Dependency Injection)
import { SQLiteQuestionnaireRepository } from '@infrastructure/persistence/SQLiteQuestionnaireRepository';
import { SQLiteAnswerRepository } from '@infrastructure/persistence/SQLiteAnswerRepository';
import { SQLitePatientRepository } from '@infrastructure/persistence/SQLitePatientRepository';
import { encryptionService } from '@infrastructure/encryption/NativeEncryptionService';
import { scrollToQuestionWithRetries, scrollToY } from './questionnaireScroll';

type Props = NativeStackScreenProps<RootStackParamList, 'Questionnaire'>;

export const QuestionnaireScreen = ({ route, navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { questionnaireId } = route.params;

  const PRACTICE_EMAIL = 'praxis@example.com';
  
  // Zustand Store
  const {
    patient,
    questionnaire,
    answers,
    currentSectionIndex,
    encryptionKey,
    isLoading,
    error,
    setQuestionnaire,
    setAnswers,
    setAnswer,
    setLoading,
    setError,
    nextSection,
    previousSection,
    goToSection,
  } = useQuestionnaireStore();

  // Selectors
  const currentSection = useQuestionnaireStore(selectCurrentSection);
  const visibleQuestions = useQuestionnaireStore(selectVisibleQuestions);
  const progress = useQuestionnaireStore(selectProgress);

  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});

  // Local State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    questionId: string;
    currentIndex: number;
  } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Use Cases (Dependency Injection)
  const loadQuestionnaireUseCase = new LoadQuestionnaireUseCase(
    new SQLiteQuestionnaireRepository(),
    new SQLiteAnswerRepository(),
    new SQLitePatientRepository(),
  );

  const saveAnswerUseCase = new SaveAnswerUseCase(
    new SQLiteAnswerRepository(),
    encryptionService,
  );

  /**
   * Load Questionnaire on Mount
   */
  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const translate = (key?: string): string => {
    if (!key) return '';
    const translated = t(key);
    return translated === key ? key : translated;
  };

  const isSectionVisible = (sectionId: string): boolean => {
    if (!questionnaire) return false;
    if (sectionId === 'personal_data') return false;
    return questionnaire.getVisibleQuestions(answers, sectionId).length > 0;
  };

  const findNextVisibleIndex = (startIndex: number, direction: 1 | -1): number | null => {
    if (!questionnaire) return null;
    let idx = startIndex + direction;
    while (idx >= 0 && idx < questionnaire.sections.length) {
      const sectionId = questionnaire.sections[idx]?.id;
      if (sectionId && isSectionVisible(sectionId)) return idx;
      idx += direction;
    }
    return null;
  };

  const visibleSectionIndices = questionnaire
    ? questionnaire.sections
        .map((section, index) => (isSectionVisible(section.id) ? index : -1))
        .filter((index) => index >= 0)
    : [];

  const currentVisibleIndex = visibleSectionIndices.indexOf(currentSectionIndex);

  const allVisibleQuestions = questionnaire ? questionnaire.getVisibleQuestions(answers) : [];
  const answeredQuestions = allVisibleQuestions.filter((question) => answers.has(question.id));

  const personalQuestionIds = new Set([
    'first_name',
    'last_name',
    'birth_date',
    'gender',
    'insurance',
    'insurance_number',
  ]);

  const findMissingRequiredQuestions = () => {
    if (!questionnaire) return [];
    const visible = questionnaire.getVisibleQuestions(answers);
    return visible.filter((q) => q.required && !answers.has(q.id));
  };

  const formatAnswerValue = (question: { options?: { value: string; labelKey: string }[] }, value: AnswerValue): string => {
    if (value === null || value === undefined) return t('common.notAnswered');
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          const labelKey = question.options?.find((opt) => opt.value === item)?.labelKey;
          return labelKey ? translate(labelKey) : String(item);
        })
        .join(', ');
    }

    const labelKey = question.options?.find((opt) => opt.value === value)?.labelKey;
    return labelKey ? translate(labelKey) : String(value);
  };

  const buildAnonymizedPayload = () => {
    if (!questionnaire) return null;
    const entries = allVisibleQuestions
      .filter((question) => !personalQuestionIds.has(question.id))
      .map((question) => ({
        id: question.id,
        label: translate(question.labelKey),
        value: formatAnswerValue(question, answers.get(question.id) as AnswerValue),
      }));

    return {
      questionnaireId: questionnaire.id,
      version: questionnaire.version,
      exportedAt: new Date().toISOString(),
      answers: entries,
    };
  };

  const handleDownloadAnonymized = (): void => {
    const payload = buildAnonymizedPayload();
    if (!payload) return;

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `anamnese-${payload.questionnaireId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToPractice = (): void => {
    const payload = buildAnonymizedPayload();
    if (!payload) return;

    const subject = encodeURIComponent(t('questionnaire.mailSubject'));
    const body = encodeURIComponent(JSON.stringify(payload, null, 2));
    window.location.href = `mailto:${PRACTICE_EMAIL}?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    if (!questionnaire || !currentSection) return;
    if (isSectionVisible(currentSection.id)) return;

    const nextIndex = findNextVisibleIndex(currentSectionIndex, 1);
    if (nextIndex !== null) {
      goToSection(nextIndex);
      return;
    }

    const prevIndex = findNextVisibleIndex(currentSectionIndex, -1);
    if (prevIndex !== null) {
      goToSection(prevIndex);
    }
  }, [answers, questionnaire, currentSection, currentSectionIndex, goToSection]);

  /**
   * Load Questionnaire + Answers
   */
  const loadQuestionnaire = async (): Promise<void> => {
    if (!patient || !encryptionKey) {
      setError('Patient or encryption key missing');
      return;
    }

    setLoading(true);

    const result = await loadQuestionnaireUseCase.execute({
      patientId: patient.id,
      questionnaireId,
      encryptionKey,
    });

    if (result.success && result.questionnaire && result.answers) {
      setQuestionnaire(result.questionnaire);
      setAnswers(result.answers);
    } else {
      setError(result.error ?? 'Failed to load questionnaire');
      Alert.alert('Error', result.error ?? 'Failed to load questionnaire');
    }

    setLoading(false);
  };

  /**
   * Handle Answer Change
   */
  const handleAnswerChange = async (questionId: string, value: AnswerValue): Promise<void> => {
    if (!questionnaire || !encryptionKey) return;

    // Update Store (optimistic update)
    setAnswer(questionId, value);

    // Clear validation error
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });

    // Find question
    const question = questionnaire.findQuestion(questionId);
    if (!question) return;

    // Save to DB (async)
    const result = await saveAnswerUseCase.execute({
      questionnaireId: questionnaire.id,
      question,
      value,
      encryptionKey,
      sourceType: 'manual',
    });

    if (!result.success) {
      if (result.validationErrors) {
        // Show validation errors
        setValidationErrors((prev) => ({
          ...prev,
          [questionId]: result.validationErrors![0],
        }));
      } else {
        Alert.alert('Error', result.error ?? 'Failed to save answer');
      }
    }
  };

  /**
   * Handle Next Section
   */
  const handleNext = (): void => {
    // Validate required questions
    if (!currentSection || !questionnaire) return;

    const requiredQuestions = visibleQuestions.filter((q) => q.required);
    const missingAnswers = requiredQuestions.filter((q) => !answers.has(q.id));

    if (missingAnswers.length > 0) {
      // Show validation errors
      const errors: Record<string, string> = {};
      missingAnswers.forEach((q) => {
        errors[q.id] = t('validation.required');
      });
      setValidationErrors(errors);
      
      // Scroll to first missing question
      const firstMissing = missingAnswers[0];
      if (firstMissing) {
        const offset = questionOffsetsRef.current[firstMissing.id];
        if (typeof offset === 'number') {
          scrollRef.current?.scrollTo({ y: offset, animated: true });
        }
      }
      
      // Create detailed error message with question labels
      const missingLabels = missingAnswers
        .map((q) => `• ${translate(q.labelKey)}`)
        .join('\n');
      
      Alert.alert(
        t('questionnaire.missingRequiredTitle'),
        t('questionnaire.missingRequiredMessage', { count: missingAnswers.length }) + '\n\n' + missingLabels,
        [{ text: t('common.ok') }]
      );
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    // Check if last section
    const nextIndex = findNextVisibleIndex(currentSectionIndex, 1);
    if (nextIndex === null) {
      const missingRequired = findMissingRequiredQuestions();
      if (missingRequired.length > 0) {
        const firstMissing = missingRequired[0];
        setValidationErrors((prev) => ({
          ...prev,
          [firstMissing.id]: t('validation.required'),
        }));
        Alert.alert(
          t('questionnaire.reviewTitle'),
          t('questionnaire.reviewRequired', { count: missingRequired.length }),
        );
        const offset = questionOffsetsRef.current[firstMissing.id];
        if (typeof offset === 'number') {
          scrollRef.current?.scrollTo({ y: offset, animated: true });
        }
        return;
      }

      setShowCompletion(true);
    } else {
      goToSection(nextIndex);
    }
  };

  /**
   * Handle Previous Section
   */
  const handlePrevious = (): void => {
    if (currentSectionIndex === 0) {
      navigation.goBack();
    } else {
      const prevIndex = findNextVisibleIndex(currentSectionIndex, -1);
      if (prevIndex !== null) {
        goToSection(prevIndex);
      } else {
        previousSection();
      }
    }
  };

  const handleBackToQuestions = (): void => {
    setShowCompletion(false);
  };

  const handleAnswerClick = (questionId: string, opts?: { forceContinue?: boolean }): void => {
    if (!questionnaire) return;

    // Find the section and index of the clicked question
    let targetSectionIndex = -1;
    for (let i = 0; i < questionnaire.sections.length; i++) {
      const section = questionnaire.sections[i];
      const found = section?.questions.some((q) => q.id === questionId);
      if (found && section) {
        targetSectionIndex = i;
        break;
      }
    }

    if (targetSectionIndex === -1) return;

    // Navigate to the correct section first
    const needsSectionChange = targetSectionIndex !== currentSectionIndex;

    const scheduleScrollToQuestion = (): void => {
      scrollToQuestionWithRetries({
        getOffset: () => questionOffsetsRef.current[questionId],
        scrollToY: (y) => scrollToY(scrollRef.current as any, y),
        initialDelayMs: needsSectionChange ? 200 : 0,
      });
    };

    const forceContinue = opts?.forceContinue === true;

    if (forceContinue) {
      if (needsSectionChange) {
        goToSection(targetSectionIndex);
      }
      scheduleScrollToQuestion();
      return;
    }

    // Check if the user needs to navigate (target is before current)
    if (targetSectionIndex < currentSectionIndex) {
      // Show dialog: continue from stopped point or restart from clicked question
      setPendingNavigation({ questionId, currentIndex: currentSectionIndex });
      Alert.alert(
        t('questionnaire.navigationTitle'),
        t('questionnaire.navigationMessage', { 
          question: translate(
            questionnaire.sections[targetSectionIndex]?.questions.find((q) => q.id === questionId)?.labelKey
          ) 
        }),
        [
          {
            text: t('questionnaire.continueFromHere'),
            onPress: () => {
              // Navigate but keep all answers
              goToSection(targetSectionIndex);
              setPendingNavigation(null);
              scheduleScrollToQuestion();
            },
          },
          {
            text: t('questionnaire.restartFromQuestion'),
            style: 'destructive',
            onPress: () => {
              // Navigate and clear all answers after this question
              goToSection(targetSectionIndex);
              if (!questionnaire) return;
              
              // Find all questions after the clicked one
              const allQuestions = questionnaire.getVisibleQuestions(answers);
              const clickedIdx = allQuestions.findIndex((q) => q.id === questionId);
              if (clickedIdx !== -1) {
                const questionsToDelete = allQuestions.slice(clickedIdx + 1);
                questionsToDelete.forEach((q) => {
                  setAnswer(q.id, undefined);
                });
              }
              
              setPendingNavigation(null);
                            scheduleScrollToQuestion();
            },
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => setPendingNavigation(null),
          },
        ]
      );
    } else {
      // Navigate to section if needed and scroll
      if (needsSectionChange) {
        goToSection(targetSectionIndex);
      }
      scheduleScrollToQuestion();
    }
  };

  const handleAnswerClickFromCompletion = (questionId: string): void => {
    setShowCompletion(false);
    setTimeout(() => {
      handleAnswerClick(questionId, { forceContinue: true });
    }, 0);
  };

  /**
   * Render Loading State
   */
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>{t('questionnaire.loading')}</Text>
      </View>
    );
  }

  /**
   * Render Error State
   */
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuestionnaire}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Render Empty State
   */
  if (!currentSection || !questionnaire) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t('questionnaire.notLoaded')}</Text>
      </View>
    );
  }

  if (showCompletion) {
    return (
      <View style={styles.container}>
        <View style={styles.completionCard}>
          <Text style={styles.completionTitle}>{t('questionnaire.completedTitle')}</Text>
          <Text style={styles.completionText}>{t('questionnaire.completedMessage')}</Text>
          <Text style={styles.completionText}>{t('questionnaire.completedInfo')}</Text>

          <View style={styles.answerOverview}>
            <Text style={styles.answerOverviewTitle}>{t('questionnaire.answersOverview')}</Text>
            <Text style={styles.answerOverviewSubtitle}>
              {t('questionnaire.answeredCount', { count: answeredQuestions.length })}
            </Text>
            <ScrollView style={styles.answerOverviewScroll}>
              {allVisibleQuestions.length === 0 ? (
                <Text style={styles.answerOverviewEmpty}>{t('questionnaire.noAnswers')}</Text>
              ) : (
                allVisibleQuestions.map((question) => (
                  <TouchableOpacity
                    key={question.id}
                    style={styles.answerOverviewRow}
                    onPress={() => handleAnswerClickFromCompletion(question.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.answerOverviewLabel}>{translate(question.labelKey)}</Text>
                    <Text style={styles.answerOverviewValue}>
                      {formatAnswerValue(question, answers.get(question.id) as AnswerValue)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.primaryAction} onPress={handleDownloadAnonymized}>
            <Text style={styles.primaryActionText}>{t('questionnaire.downloadAnonymized')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleSendToPractice}>
            <Text style={styles.secondaryActionText}>{t('questionnaire.sendToPractice')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryActionText}>{t('questionnaire.backToStart')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleBackToQuestions}>
            <Text style={styles.secondaryActionText}>{t('questionnaire.backToQuestions')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * Main Render
   */
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Dark Mode Toggle */}
      <TouchableOpacity
        style={[styles.darkModeToggle, isDarkMode && styles.darkModeToggleActive]}
        onPress={() => setIsDarkMode(!isDarkMode)}>
        <Text style={styles.darkModeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {t('questionnaire.progress', { count: Math.round(progress) })}
        </Text>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{translate(currentSection.titleKey)}</Text>
        <Text style={styles.sectionNumber}>
          {t('questionnaire.section', {
            current: Math.max(currentVisibleIndex + 1, 1),
            total: visibleSectionIndices.length || questionnaire.sections.length,
          })}
        </Text>
      </View>

      {/* Answer Overview */}
      <View style={styles.answerOverview}>
        <Text style={styles.answerOverviewTitle}>{t('questionnaire.answersOverview')}</Text>
        <Text style={styles.answerOverviewSubtitle}>
          {t('questionnaire.answeredCount', { count: answeredQuestions.length })}
        </Text>
        <ScrollView style={styles.answerOverviewScroll}>
          {answeredQuestions.length === 0 ? (
            <Text style={styles.answerOverviewEmpty}>{t('questionnaire.noAnswers')}</Text>
          ) : (
            answeredQuestions.map((question) => (
              <TouchableOpacity
                key={question.id}
                style={styles.answerOverviewRow}
                onPress={() => handleAnswerClick(question.id)}
                activeOpacity={0.7}>
                <Text style={styles.answerOverviewLabel}>{translate(question.labelKey)}</Text>
                <Text style={styles.answerOverviewValue}>
                  {formatAnswerValue(question, answers.get(question.id) as AnswerValue)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Questions */}
      <ScrollView ref={scrollRef} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {visibleQuestions.map((question) => (
          <View
            key={question.id}
            onLayout={(event) => {
              questionOffsetsRef.current[question.id] = event.nativeEvent.layout.y;
            }}>
            <QuestionCard
              question={question}
              value={answers.get(question.id)}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              error={validationErrors[question.id]}
            />
          </View>
        ))}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton]}
          onPress={handlePrevious}>
          <Text style={styles.navButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}>
          <Text style={styles.navButtonText}>
            {currentSectionIndex === questionnaire.sections.length - 1
              ? `${t('questionnaire.complete')} →`
              : `${t('common.next')} →`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    transition: 'background-color 0.3s ease',
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  darkModeToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  darkModeToggleActive: {
    backgroundColor: '#374151',
  },
  darkModeIcon: {
    fontSize: 24,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionNumber: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  answerOverview: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  answerOverviewScroll: {
    maxHeight: 220,
  },
  answerOverviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  answerOverviewSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  answerOverviewEmpty: {
    fontSize: 14,
    color: '#9ca3af',
  },
  answerOverviewRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderRadius: 6,
    marginBottom: 4,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
  },
  answerOverviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  answerOverviewValue: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  completionCard: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  primaryAction: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    marginTop: 12,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: '#f3f4f6',
  },
  nextButton: {
    backgroundColor: '#2563eb',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
