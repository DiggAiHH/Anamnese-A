/**
 * QuestionCard Component - Universelle Frage-Komponente
 * 
 * VERBINDUNG:
 * QuestionCard (Component)
 *   → useQuestionnaireStore (State)
 *   → SaveAnswerUseCase (Use Case)
 *   → Answer Repository (Persistence)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Question } from '@domain/entities/Questionnaire';
import { AnswerValue } from '@domain/entities/Answer';

interface QuestionCardProps {
  question: Question;
  value?: AnswerValue;
  onValueChange: (value: AnswerValue) => void;
  error?: string;
}

/**
 * QuestionCard - rendert verschiedene Fragetypen
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onValueChange,
  error,
}) => {
  const { t } = useTranslation();

  const translate = (key?: string): string => {
    if (!key) return '';
    const translated = t(key);
    return translated === key ? key : translated;
  };

  const renderInput = (): React.ReactNode => {
    switch (question.type) {
      case 'text':
      case 'textarea':
        return renderTextInput();
      
      case 'number':
        return renderNumberInput();
      
      case 'slider':
        return renderSliderInput();
      
      case 'date':
        return renderDateInput();
      
      case 'radio':
        return renderRadioInput();
      
      case 'checkbox':
      case 'multiselect':
        return renderCheckboxInput();
      
      case 'select':
        return renderSelectInput();
      
      default:
        return <Text>Unsupported question type: {question.type}</Text>;
    }
  };

  /**
   * Text Input (text, textarea)
   */
  const renderTextInput = (): React.ReactNode => {
    return (
      <TextInput
        style={[
          styles.textInput,
          question.type === 'textarea' && styles.textareaInput,
          error ? styles.inputError : undefined,
        ]}
        value={(value as string) ?? ''}
        onChangeText={(text: string) => onValueChange(text)}
        placeholder={translate(question.placeholderKey)}
        multiline={question.type === 'textarea'}
        numberOfLines={question.type === 'textarea' ? 4 : 1}
      />
    );
  };

  /**
   * Number Input
   */
  const renderNumberInput = (): React.ReactNode => {
    return (
      <TextInput
        style={[styles.textInput, error ? styles.inputError : undefined]}
        value={value?.toString() ?? ''}
        onChangeText={(text: string) => {
          const num = parseFloat(text);
          onValueChange(isNaN(num) ? null : num);
        }}
        keyboardType="numeric"
        placeholder={translate(question.placeholderKey)}
      />
    );
  };

  /**
   * Slider Input (für Schmerzintensität etc.) - Web-kompatibel
   */
  const renderSliderInput = (): React.ReactNode => {
    const [localValue, setLocalValue] = useState<number>((value as number) ?? 0);
    const min = question.validation?.min ?? 0;
    const max = question.validation?.max ?? 10;

    const handleSliderChange = (event: any) => {
      const newValue = Number(event.target.value);
      setLocalValue(newValue);
    };

    const handleSliderRelease = () => {
      onValueChange(Math.round(localValue));
    };

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderMinMax}>{min}</Text>
          <View style={styles.sliderValueContainer}>
            <Text style={styles.sliderValue}>{Math.round(localValue)}</Text>
            <Text style={styles.sliderValueLabel}>/10</Text>
          </View>
          <Text style={styles.sliderMinMax}>{max}</Text>
        </View>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(localValue / max) * 100}%, #e5e7eb ${(localValue / max) * 100}%, #e5e7eb 100%)`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelText}>😊 Kein Schmerz</Text>
          <Text style={styles.sliderLabelText}>😣 Stärkster Schmerz</Text>
        </View>
      </View>
    );
  };

  /**
   * Date Input (simplified - use react-native-date-picker in production)
   */
  const renderDateInput = (): React.ReactNode => {
    return (
      <TextInput
        style={[styles.textInput, error ? styles.inputError : undefined]}
        value={(value as string) ?? ''}
        onChangeText={(text: string) => onValueChange(text)}
        placeholder="DD.MM.YYYY"
      />
    );
  };

  /**
   * Radio Input (single choice)
   */
  const renderRadioInput = (): React.ReactNode => {
    if (!question.options) return null;

    return (
      <View style={styles.optionsContainer}>
        {question.options.map((option: NonNullable<Question['options']>[number]) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioOption}
            onPress={() => onValueChange(option.value)}>
            <View
              style={[
                styles.radioCircle,
                value === option.value && styles.radioCircleSelected,
              ]}>
              {value === option.value && <View style={styles.radioCircleInner} />}
            </View>
            <Text style={styles.optionLabel}>{translate(option.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Checkbox Input (multiple choice)
   */
  const renderCheckboxInput = (): React.ReactNode => {
    if (!question.options) return null;

    const selectedValues = (value as string[]) ?? [];

    const toggleOption = (optionValue: string): void => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      
      onValueChange(newValues);
    };

    return (
      <View style={styles.optionsContainer}>
        {question.options.map((option: NonNullable<Question['options']>[number]) => (
          <TouchableOpacity
            key={option.value}
            style={styles.checkboxOption}
            onPress={() => toggleOption(option.value)}>
            <View
              style={[
                styles.checkbox,
                selectedValues.includes(option.value) && styles.checkboxSelected,
              ]}>
              {selectedValues.includes(option.value) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.optionLabel}>{translate(option.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Select Input (dropdown)
   */
  const renderSelectInput = (): React.ReactNode => {
    if (!question.options) return null;

    return (
      <ScrollView style={styles.selectContainer}>
        {question.options.map((option: NonNullable<Question['options']>[number]) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              value === option.value && styles.selectOptionSelected,
            ]}
            onPress={() => onValueChange(option.value)}>
            <Text
              style={[
                styles.selectOptionText,
                value === option.value && styles.selectOptionTextSelected,
              ]}>
              {translate(option.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Question Label */}
      <Text style={styles.label}>
        {translate(question.labelKey)}
        {question.required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Help Text */}
      {question.helpTextKey && (
        <View style={styles.helpTextContainer}>
          <Text style={styles.helpIcon}>ℹ️</Text>
          <Text style={styles.helpText}>{translate(question.helpTextKey)}</Text>
        </View>
      )}

      {/* Input */}
      {renderInput()}

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textareaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    backgroundColor: '#2563eb',
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  sliderContainer: {
    marginTop: 8,
    paddingVertical: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  helpTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  helpIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
