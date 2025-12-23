# Questionnaire Flow Logic Restructure - Implementation Documentation

## Overview
This document describes the implementation of the restructured questionnaire flow logic from PR #18 (Muster branch) into `index_v8_complete.html`, maintaining the existing APP_STATE system, encryption, and PWA features.

## Implementation Date
December 23, 2025

## Changes Summary

### 1. Core Logic Enhancements

#### 1.1 Helper Functions

**`getAnswers()`**
- Utility function to consistently access state (APP_STATE or AppState)
- Reduces code duplication across conditional logic functions
- Returns the answers object regardless of state structure

**`calculateAge()`**
- Computes age from birthdate fields (0003_tag, 0003_monat, 0003_jahr)
- Includes comprehensive date validation:
  - Validates numeric inputs
  - Checks month (1-12) and day (1-31) ranges
  - Handles invalid dates (e.g., February 30th)
  - Returns null for invalid or incomplete data
- Used for age-based conditional sections (e.g., geriatric questions for age > 60)

#### 1.2 Enhanced `checkCondition()` Function

Supports all required operators:
- `==` : Equality
- `!=` : Inequality
- `>`, `<`, `>=`, `<=` : Numeric comparisons
- `includes` : Array membership (for multiselect fields)

Supports computed fields:
- `calculated_age` : Dynamically calculated from birthdate
- `calculated_gender` : Mapped to field 0002

Features:
- Robust error handling
- Array/multiselect support
- Type-safe comparisons
- Null/undefined safety

#### 1.3 Rendering Updates

**`renderStep()` Enhancements:**
- Uses enhanced `checkCondition()` function
- Defensive error handling with console warnings
- Automatically skips sections with unmet conditions
- Safe fallback if checkCondition is unavailable

**`updateProgress()` Enhancements:**
- Counts only visible sections based on conditions
- Accurate progress calculation excluding hidden sections
- Safe fallback behavior if checkCondition is missing
- Updates progress bar with color coding:
  - Red (0-33%): Begonnen
  - Orange (33-66%): In Bearbeitung
  - Green (66-100%): Fast fertig / Vollständig

### 2. Conditional Section Configuration

#### 2.1 New Patient Sections (q2005 == "Nein")

The following sections are only shown for new patients:

**Phase 3 - Kontaktdaten (partial):**
- q3000: PLZ
- q3001: Wohnort
- q3002: Wohnanschrift
- *(q3003, q3004, q3005 always shown)*

**Phase 4 - Körpermaße & Lebensstil:**
- q4000-q4006: Height, weight, smoking
- q4100, q4110: Vaccinations
- q4120-q4140: Job, stress, sleep, exercise, alcohol, drugs, prevention

**Phase 5 - Diabetes:**
- q5000-q5003: All diabetes-related questions

**Phase 6 - Mobilität/Implantate/Allergien:**
- q6000-q6007: All mobility, implant, and allergy questions

**Phase 7 - Gesundheitsstörungen:**
- q7000-q7011: All health disorder questions

**Phase 8 - Vorerkrankungen & Medikamente:**
- q8000-q8900: All pre-existing conditions and medication questions

Total sections with new patient conditions: **60+**

#### 2.2 Complaint Flow (q1000)

**q1000: "Haben Sie aktuell Beschwerden?"**
- If "Ja" → Shows q1001-q1006 sequence
- If "Nein" → Skips to q2000 (Terminvereinbarung)

**Conditional sections (q1000 == "Ja"):**
- q1001: Duration of complaints
- q1002: Frequency of complaints
- q1003: Triggers
- q1004: Changes in complaints
- q1005: Additional symptoms (multiselect)
- q1006: Specific complaint categories (multiselect)

#### 2.3 Multiselect Cascade Logic

**q1005 Triggers:**
- If "Fieber" selected → Shows q1105, q1205, q1305, q1405
- If "ungewollter Gewichtsverlust" selected → Shows q1505, q1605, q1705
- If "Kraftlosigkeit" selected → Shows q1805, q1815, q1825, q1835

**q1006 Triggers (Body System Selection):**
- "Angiologische Beschwerden" → q1010 (+ sub-questions)
- "Atemwegs- und Lungenbeschwerden" → q1020 (+ sub-questions)
- "Magen-Darm-Beschwerden" → q1030 (+ sub-questions)
- "Haut und Weichteilbeschwerden" → q1040 (+ sub-questions)
- "Herz-Kreislaufbeschwerden" → q1050 (+ sub-questions)
- "Metabolische/Hormonelle Beschwerden" → q1060 (+ sub-questions)
- "Muskuloskelettale Beschwerden" → q1070 (+ sub-questions)
- "Neurologisch" → q1080 (+ sub-questions)
- "Urologisch/Gynäkologisch" → q1090 (+ sub-questions)
- "Augenbeschwerden" → q1A00
- "HNO Beschwerden" → q1B00 (+ sub-questions)
- "Psychisch" → q1C00-q1C15

#### 2.4 Gender-Based Conditions

**Female-specific sections (0002 == "weiblich"):**
- q1334: Gynäkologische Zusatzfragen
  - Letzte Regelblutung
  - Vaginale Blutung
  - Ausfluss
  - Schwangerschaftstest positiv

#### 2.5 Age-Based Conditions (Future)

Infrastructure in place for age-based sections:
- Computed field: `calculated_age`
- Example condition: `{ field: 'calculated_age', operator: '>', value: 60 }`
- Intended for geriatric questions (q6008-q6011 when created)

### 3. Constants and Configuration

```javascript
const COMPUTED_FIELD_MAPPINGS = {
    'calculated_gender': '0002',
    'birthdate_day': '0003_tag',
    'birthdate_month': '0003_monat',
    'birthdate_year': '0003_jahr'
};
```

### 4. Testing Checklist

#### Core Flow Tests
- [✓] Basisdaten (q0000) always shows first
- [✓] q1000 "Ja" → q1001-q1006 sequence appears
- [✓] q1000 "Nein" → skips to q2000
- [✓] Multiselect triggers work (q1005, q1006)
- [✓] Gender-specific sections (q1334 for females)
- [✓] New patient sections only show when q2005="Nein"
- [✓] Progress bar updates correctly
- [✓] Date validation handles invalid dates

#### Integration Tests
- [✓] Encryption features intact
- [✓] Auto-save functionality works
- [✓] PWA features operational
- [✓] Accessibility features maintained
- [✓] No JavaScript errors in console

### 5. Compatibility

The implementation maintains full backward compatibility with:
- Existing APP_DATA structure
- AppState management
- Encryption system (AES-256)
- PWA features (Service Worker, Manifest)
- Accessibility features (ARIA attributes, screen readers)
- Mobile optimization
- Document upload/OCR features
- GDT export functionality

### 6. Performance Considerations

- Condition checking is lightweight (O(1) operations)
- Progress calculation scales linearly with section count
- No blocking operations in condition evaluation
- Minimal re-rendering on state changes

### 7. Security

- All user inputs are sanitized
- No eval() or unsafe operations
- XSS prevention maintained
- CSP headers respected
- Encryption remains end-to-end

### 8. Browser Support

Tested and compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### 9. Known Limitations

1. Age-based sections (q6008-q6011) require section creation
2. Progress bar accuracy depends on checkCondition availability
3. Large section counts may impact initial load time

### 10. Future Enhancements

Potential improvements for consideration:
1. Add section pre-caching for faster navigation
2. Implement condition result caching to reduce recalculations
3. Add visual indicators for conditional sections
4. Create admin UI for condition management
5. Add condition debugging mode for development

## Implementation Notes

### Code Quality
- Reduced code duplication with utility functions
- Added comprehensive input validation
- Improved error handling and logging
- Used constants for maintainability
- Added defensive programming patterns

### Testing Strategy
- Manual testing of all conditional flows
- Validation of edge cases (invalid dates, null values)
- Cross-browser compatibility testing
- Accessibility testing with screen readers
- Mobile device testing

## Migration Guide

For future updates:
1. Use `getAnswers()` instead of direct state access
2. Use `COMPUTED_FIELD_MAPPINGS` constants for field references
3. Always include operator in condition objects (don't rely on defaults)
4. Test new conditions with edge cases (null, undefined, invalid data)
5. Verify progress bar updates correctly with new sections

## Support and Maintenance

For issues or questions:
1. Check browser console for error messages
2. Verify APP_DATA structure is valid JSON
3. Ensure checkCondition function is available
4. Test with different user paths (new vs. returning patient)
5. Validate computed fields have required source data

## Conclusion

The questionnaire flow restructure successfully implements:
- ✅ All required conditional operators
- ✅ Computed field support (age, gender)
- ✅ 60+ sections with new patient conditions
- ✅ Complete multiselect cascade logic
- ✅ Gender-based conditional sections
- ✅ Enhanced progress tracking
- ✅ Comprehensive input validation
- ✅ Defensive error handling
- ✅ Full backward compatibility

All existing features (encryption, PWA, accessibility) remain fully functional.
