'use strict';

/**
 * Question Container Architecture v1.0
 * 
 * Privacy by Design: Antworten werden nur als Integer gespeichert.
 * Export-Format: ContainerID:AnswerValue (z.B. "2:1" = Frage 2, Antwort "Ja")
 * 
 * @fileoverview Modulare Fragebogen-Architektur mit Integer-basiertem Antwort-System
 * @author Anamnese-A Team
 * @license PROPRIETARY - Medical Data Processing
 * @security GDPR Art. 25 compliant - Privacy by Design
 */

// ============================================================================
// ENUMS (Integer-basiert)
// ============================================================================

/**
 * Input-Typen für Fragen
 * @readonly
 * @enum {number}
 */
const InputType = Object.freeze({
  TEXT: 1,              // Freitext-Eingabe
  TEXT_MULTILINE: 2,    // Mehrzeiliger Text
  SINGLE_CHOICE: 3,     // Radio-Buttons (eine Auswahl)
  MULTI_CHOICE: 4,      // Checkboxen (mehrere Auswahlen)
  DATE: 5,              // Datum (Tag/Monat/Jahr)
  NUMBER: 6,            // Numerische Eingabe
  SCALE: 7,             // Skala (1-10, Schmerzskala etc.)
  YES_NO: 8,            // Ja/Nein (binär: 1/0)
  DROPDOWN: 9,          // Dropdown-Auswahl
  TIME: 10,             // Uhrzeit
  FILE_UPLOAD: 11,      // Datei-Upload (z.B. Dokumente)
  SIGNATURE: 12         // Unterschrift
});

/**
 * Kategorie-Typen (Überbegriffe)
 * @readonly
 * @enum {number}
 */
const Category = Object.freeze({
  UNKNOWN: 0,
  BASISDATEN: 1,
  BESCHWERDEN: 2,
  TERMINVEREINBARUNG: 3,
  KONTAKTDATEN: 4,
  KOERPERMASSE_LEBENSSTIL: 5,
  DIABETES: 6,
  MOBILITAET_IMPLANTATE_ALLERGIEN: 7,
  GESUNDHEITSSTOERUNGEN: 8,
  VORERKRANKUNGEN_MEDIKAMENTE: 9,
  GYNAEKOLOGIE: 10,
  PSYCHE: 11,
  EINWILLIGUNG: 12
});

/**
 * Reverse-Lookup für Category-Namen
 * @type {Object<number, string>}
 */
const CategoryNames = Object.freeze({
  0: 'Unkategorisiert',
  1: 'Basisdaten',
  2: 'Beschwerden',
  3: 'Terminvereinbarung',
  4: 'Kontaktdaten',
  5: 'Körpermaße & Lebensstil',
  6: 'Diabetes',
  7: 'Mobilität/Implantate/Allergien',
  8: 'Gesundheitsstörungen',
  9: 'Vorerkrankungen & Medikamente',
  10: 'Gynäkologie',
  11: 'Psyche',
  12: 'Einwilligung'
});

// ============================================================================
// QUESTION CONTAINER KLASSE
// ============================================================================

/**
 * @typedef {Object} AnswerOption
 * @property {number} value - Integer-Wert der Antwort (0, 1, 2, ...)
 * @property {string} label - Anzeigetext der Antwort
 * @property {string} [labelEn] - Englischer Text (optional)
 */

/**
 * @typedef {Object} QuestionCondition
 * @property {number} dependsOnContainer - Container-ID der Abhängigkeit
 * @property {string} operator - Operator ('==', '!=', '>', '<', 'includes')
 * @property {number|number[]} value - Erwarteter Wert oder Werte
 */

/**
 * Immutable Question Container
 * Repräsentiert eine einzelne Frage mit allen Metadaten
 */
class QuestionContainer {
  /**
   * @param {Object} config - Konfigurationsobjekt
   * @param {number} config.id - Eindeutige Container-ID (int16, 1-65535)
   * @param {string} config.questionCode - Legacy Q-Code (z.B. 'q1000')
   * @param {number} config.category - Kategorie-Enum-Wert
   * @param {string} config.subcategory - Unterkategorie/Begriff
   * @param {string} config.label - Fragetext
   * @param {number} config.inputType - InputType-Enum-Wert
   * @param {AnswerOption[]} [config.options] - Antwortoptionen (für Choice-Typen)
   * @param {boolean} [config.required=false] - Pflichtfeld
   * @param {boolean} [config.privacyRelevant=false] - DSGVO-relevant (PII)
   * @param {QuestionCondition} [config.condition] - Anzeigebedingung
   * @param {string} [config.helpText] - Hilfetext
   * @param {string} [config.validationRegex] - Validierungs-Pattern
   * @param {number} [config.minValue] - Min-Wert (für NUMBER/SCALE)
   * @param {number} [config.maxValue] - Max-Wert (für NUMBER/SCALE)
   * @security PII-Felder werden durch privacyRelevant=true markiert
   */
  constructor(config) {
    // Validierung
    if (!Number.isInteger(config.id) || config.id < 1 || config.id > 65535) {
      throw new RangeError(`Container ID must be int16 (1-65535), got: ${config.id}`);
    }
    if (!Object.values(InputType).includes(config.inputType)) {
      throw new TypeError(`Invalid inputType: ${config.inputType}`);
    }
    if (!Object.values(Category).includes(config.category)) {
      throw new TypeError(`Invalid category: ${config.category}`);
    }

    // Immutable Properties
    /** @type {number} */
    this.id = config.id;
    
    /** @type {string} */
    this.questionCode = config.questionCode;
    
    /** @type {number} */
    this.category = config.category;
    
    /** @type {string} */
    this.categoryName = CategoryNames[config.category];
    
    /** @type {string} */
    this.subcategory = config.subcategory;
    
    /** @type {string} */
    this.label = config.label;
    
    /** @type {number} */
    this.inputType = config.inputType;
    
    /** @type {AnswerOption[]} */
    this.options = Object.freeze(config.options || []);
    
    /** @type {boolean} */
    this.required = Boolean(config.required);
    
    /** @type {boolean} */
    this.privacyRelevant = Boolean(config.privacyRelevant);
    
    /** @type {QuestionCondition|null} */
    this.condition = config.condition ? Object.freeze(config.condition) : null;
    
    /** @type {string} */
    this.helpText = config.helpText || '';
    
    /** @type {string|null} */
    this.validationRegex = config.validationRegex || null;
    
    /** @type {number|null} */
    this.minValue = config.minValue ?? null;
    
    /** @type {number|null} */
    this.maxValue = config.maxValue ?? null;

    // Freeze instance
    Object.freeze(this);
  }

  /**
   * Prüft ob InputType Optionen erfordert
   * @returns {boolean}
   */
  requiresOptions() {
    return [
      InputType.SINGLE_CHOICE,
      InputType.MULTI_CHOICE,
      InputType.DROPDOWN,
      InputType.SCALE
    ].includes(this.inputType);
  }

  /**
   * Konvertiert Antwort-Integer zu Label
   * @param {number|number[]} answerValue - Integer-Antwort(en)
   * @returns {string|string[]} - Label(s)
   */
  valueToLabel(answerValue) {
    if (Array.isArray(answerValue)) {
      return answerValue.map(v => this._singleValueToLabel(v));
    }
    return this._singleValueToLabel(answerValue);
  }

  /**
   * @private
   * @param {number} value
   * @returns {string}
   */
  _singleValueToLabel(value) {
    if (this.inputType === InputType.YES_NO) {
      return value === 1 ? 'Ja' : 'Nein';
    }
    const option = this.options.find(o => o.value === value);
    return option ? option.label : String(value);
  }

  /**
   * Konvertiert Label zu Integer-Wert
   * @param {string} label - Antwort-Label
   * @returns {number|null} - Integer-Wert oder null
   */
  labelToValue(label) {
    if (this.inputType === InputType.YES_NO) {
      const normalized = label.toLowerCase().trim();
      if (normalized === 'ja' || normalized === 'yes' || normalized === '1') return 1;
      if (normalized === 'nein' || normalized === 'no' || normalized === '0') return 0;
      return null;
    }
    const option = this.options.find(o => 
      o.label.toLowerCase() === label.toLowerCase()
    );
    return option ? option.value : null;
  }

  /**
   * Validiert einen Antwort-Wert
   * @param {number|number[]|string} value - Zu validierender Wert
   * @returns {{valid: boolean, error?: string}}
   */
  validateAnswer(value) {
    // Pflichtfeld-Check
    if (this.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: 'Pflichtfeld' };
    }

    // Leere Werte bei nicht-Pflichtfeldern OK
    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    switch (this.inputType) {
      case InputType.YES_NO:
        if (value !== 0 && value !== 1) {
          return { valid: false, error: 'Wert muss 0 oder 1 sein' };
        }
        break;

      case InputType.SINGLE_CHOICE:
      case InputType.DROPDOWN:
        if (!this.options.some(o => o.value === value)) {
          return { valid: false, error: 'Ungültige Auswahl' };
        }
        break;

      case InputType.MULTI_CHOICE:
        if (!Array.isArray(value)) {
          return { valid: false, error: 'Array erwartet' };
        }
        for (const v of value) {
          if (!this.options.some(o => o.value === v)) {
            return { valid: false, error: `Ungültige Auswahl: ${v}` };
          }
        }
        break;

      case InputType.NUMBER:
      case InputType.SCALE:
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, error: 'Numerischer Wert erwartet' };
        }
        if (this.minValue !== null && value < this.minValue) {
          return { valid: false, error: `Minimum: ${this.minValue}` };
        }
        if (this.maxValue !== null && value > this.maxValue) {
          return { valid: false, error: `Maximum: ${this.maxValue}` };
        }
        break;

      case InputType.TEXT:
      case InputType.TEXT_MULTILINE:
        if (this.validationRegex) {
          const regex = new RegExp(this.validationRegex);
          if (!regex.test(String(value))) {
            return { valid: false, error: 'Format ungültig' };
          }
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Serialisiert zu JSON (für Export/Speicherung)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      questionCode: this.questionCode,
      category: this.category,
      subcategory: this.subcategory,
      label: this.label,
      inputType: this.inputType,
      options: this.options,
      required: this.required,
      privacyRelevant: this.privacyRelevant,
      condition: this.condition,
      helpText: this.helpText
    };
  }
}

// ============================================================================
// ANSWER REGISTRY (Integer-only Speicher)
// ============================================================================

/**
 * Registry für Antworten - speichert NUR Integer-Werte
 * Privacy by Design: Keine PII im Antwort-Speicher
 * 
 * @security GDPR Art. 25 - Nur pseudonymisierte Werte
 */
class AnswerRegistry {
  constructor() {
    /**
     * Antwort-Speicher: Map<ContainerID, AnswerValue>
     * @type {Map<number, number|number[]>}
     * @private
     */
    this._answers = new Map();

    /**
     * Timestamp der letzten Änderung pro Container
     * @type {Map<number, number>}
     * @private
     */
    this._timestamps = new Map();
  }

  /**
   * Setzt eine Antwort
   * @param {number} containerId - Container-ID
   * @param {number|number[]} value - Integer-Wert(e)
   * @throws {TypeError} Bei nicht-numerischen Werten
   */
  set(containerId, value) {
    // Validierung: Nur Integer erlaubt
    if (Array.isArray(value)) {
      if (!value.every(v => Number.isInteger(v))) {
        throw new TypeError('AnswerRegistry: Nur Integer-Werte erlaubt');
      }
    } else if (!Number.isInteger(value) && value !== null) {
      throw new TypeError('AnswerRegistry: Nur Integer-Werte erlaubt');
    }

    if (value === null) {
      this._answers.delete(containerId);
      this._timestamps.delete(containerId);
    } else {
      this._answers.set(containerId, value);
      this._timestamps.set(containerId, Date.now());
    }
  }

  /**
   * Holt eine Antwort
   * @param {number} containerId - Container-ID
   * @returns {number|number[]|undefined}
   */
  get(containerId) {
    return this._answers.get(containerId);
  }

  /**
   * Prüft ob Antwort existiert
   * @param {number} containerId
   * @returns {boolean}
   */
  has(containerId) {
    return this._answers.has(containerId);
  }

  /**
   * Löscht eine Antwort
   * @param {number} containerId
   */
  delete(containerId) {
    this._answers.delete(containerId);
    this._timestamps.delete(containerId);
  }

  /**
   * Löscht alle Antworten (GDPR Art. 17 - Right to Erasure)
   */
  clear() {
    this._answers.clear();
    this._timestamps.clear();
  }

  /**
   * Anzahl der Antworten
   * @returns {number}
   */
  get size() {
    return this._answers.size;
  }

  /**
   * Exportiert als kompaktes Format für Übertragung
   * Format: "containerID:value,containerID:value,..."
   * 
   * @returns {string} Kompakter Export-String
   * @example "1:1,2:0,5:3,10:[1,3,5]"
   */
  toCompactString() {
    const parts = [];
    for (const [id, value] of this._answers) {
      if (Array.isArray(value)) {
        parts.push(`${id}:[${value.join(',')}]`);
      } else {
        parts.push(`${id}:${value}`);
      }
    }
    return parts.join(',');
  }

  /**
   * Importiert aus kompaktem Format
   * @param {string} compactString
   */
  fromCompactString(compactString) {
    this.clear();
    if (!compactString) return;

    const pairs = compactString.split(',');
    for (const pair of pairs) {
      const [idStr, valueStr] = pair.split(':');
      const id = parseInt(idStr, 10);
      
      if (isNaN(id)) continue;

      if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
        // Array-Wert
        const arrayContent = valueStr.slice(1, -1);
        const values = arrayContent.split(',').map(v => parseInt(v, 10));
        this.set(id, values);
      } else {
        this.set(id, parseInt(valueStr, 10));
      }
    }
  }

  /**
   * Exportiert als JSON-Objekt
   * @returns {Object<number, number|number[]>}
   */
  toJSON() {
    const obj = {};
    for (const [id, value] of this._answers) {
      obj[id] = value;
    }
    return obj;
  }

  /**
   * Importiert aus JSON-Objekt
   * @param {Object<number, number|number[]>} json
   */
  fromJSON(json) {
    this.clear();
    for (const [idStr, value] of Object.entries(json)) {
      const id = parseInt(idStr, 10);
      if (!isNaN(id)) {
        this.set(id, value);
      }
    }
  }

  /**
   * Iteriert über alle Antworten
   * @yields {[number, number|number[]]}
   */
  *[Symbol.iterator]() {
    yield* this._answers;
  }
}

// ============================================================================
// QUESTION CATALOG (Container-Sammlung)
// ============================================================================

/**
 * Katalog aller Fragen-Container
 * Singleton-Pattern für globalen Zugriff
 */
class QuestionCatalog {
  constructor() {
    /**
     * @type {Map<number, QuestionContainer>}
     * @private
     */
    this._containers = new Map();

    /**
     * Index: questionCode -> containerId
     * @type {Map<string, number>}
     * @private
     */
    this._codeIndex = new Map();
  }

  /**
   * Registriert einen Container
   * @param {QuestionContainer} container
   * @throws {Error} Bei doppelter ID oder Code
   */
  register(container) {
    if (this._containers.has(container.id)) {
      throw new Error(`Container ID ${container.id} bereits registriert`);
    }
    if (this._codeIndex.has(container.questionCode)) {
      throw new Error(`Question Code ${container.questionCode} bereits registriert`);
    }

    this._containers.set(container.id, container);
    this._codeIndex.set(container.questionCode, container.id);
  }

  /**
   * Registriert mehrere Container aus Config-Array
   * @param {Object[]} configs - Array von Container-Konfigurationen
   */
  registerBatch(configs) {
    for (const config of configs) {
      this.register(new QuestionContainer(config));
    }
  }

  /**
   * Holt Container nach ID
   * @param {number} id
   * @returns {QuestionContainer|undefined}
   */
  getById(id) {
    return this._containers.get(id);
  }

  /**
   * Holt Container nach Legacy-Code
   * @param {string} questionCode - z.B. 'q1000'
   * @returns {QuestionContainer|undefined}
   */
  getByCode(questionCode) {
    const id = this._codeIndex.get(questionCode);
    return id !== undefined ? this._containers.get(id) : undefined;
  }

  /**
   * Alle Container einer Kategorie
   * @param {number} category - Category-Enum-Wert
   * @returns {QuestionContainer[]}
   */
  getByCategory(category) {
    const result = [];
    for (const container of this._containers.values()) {
      if (container.category === category) {
        result.push(container);
      }
    }
    return result.sort((a, b) => a.id - b.id);
  }

  /**
   * Alle Container sortiert nach ID
   * @returns {QuestionContainer[]}
   */
  getAll() {
    return Array.from(this._containers.values()).sort((a, b) => a.id - b.id);
  }

  /**
   * Alle PII-relevanten Container
   * @returns {QuestionContainer[]}
   */
  getPrivacyRelevant() {
    return this.getAll().filter(c => c.privacyRelevant);
  }

  /**
   * Anzahl der Container
   * @returns {number}
   */
  get size() {
    return this._containers.size;
  }

  /**
   * Prüft Anzeigebedingung eines Containers
   * @param {number} containerId
   * @param {AnswerRegistry} answers
   * @returns {boolean}
   */
  checkCondition(containerId, answers) {
    const container = this._containers.get(containerId);
    if (!container || !container.condition) {
      return true; // Kein Container oder keine Bedingung = sichtbar
    }

    const { dependsOnContainer, operator, value } = container.condition;
    const answer = answers.get(dependsOnContainer);

    if (answer === undefined) {
      return false; // Abhängige Frage nicht beantwortet
    }

    switch (operator) {
      case '==':
        return answer === value;
      case '!=':
        return answer !== value;
      case '>':
        return answer > value;
      case '<':
        return answer < value;
      case '>=':
        return answer >= value;
      case '<=':
        return answer <= value;
      case 'includes':
        return Array.isArray(answer) && answer.includes(value);
      default:
        console.warn(`Unknown operator: ${operator}`);
        return true;
    }
  }

  /**
   * Alle sichtbaren Container basierend auf Antworten
   * @param {AnswerRegistry} answers
   * @returns {QuestionContainer[]}
   */
  getVisibleContainers(answers) {
    return this.getAll().filter(c => this.checkCondition(c.id, answers));
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Generiert menschenlesbaren Export aus Antworten
 * @param {QuestionCatalog} catalog
 * @param {AnswerRegistry} answers
 * @returns {Object[]} Array von {question, answer} Objekten
 */
function generateReadableExport(catalog, answers) {
  const result = [];
  
  for (const [containerId, value] of answers) {
    const container = catalog.getById(containerId);
    if (!container) continue;

    result.push({
      id: containerId,
      questionCode: container.questionCode,
      category: container.categoryName,
      question: container.label,
      answerValue: value,
      answerLabel: container.valueToLabel(value),
      privacyRelevant: container.privacyRelevant
    });
  }

  return result.sort((a, b) => a.id - b.id);
}

/**
 * Generiert GDT-kompatiblen Export (nur Integer-Werte)
 * @param {AnswerRegistry} answers
 * @returns {string} Kompakter String für GDT-Übertragung
 */
function generateGDTExport(answers) {
  return answers.toCompactString();
}

// ============================================================================
// BEISPIEL-KONFIGURATION (Basisdaten)
// ============================================================================

/**
 * Beispiel-Definition für Migration der ersten Fragen
 * @type {Object[]}
 */
const EXAMPLE_QUESTIONS = [
  {
    id: 1,
    questionCode: 'q0000',
    category: Category.BASISDATEN,
    subcategory: 'Persönliche Informationen',
    label: 'Vorname',
    inputType: InputType.TEXT,
    required: true,
    privacyRelevant: true,
    validationRegex: '^[A-Za-zÄÖÜäöüß\\-\\s]{2,50}$'
  },
  {
    id: 2,
    questionCode: 'q0001',
    category: Category.BASISDATEN,
    subcategory: 'Persönliche Informationen',
    label: 'Nachname',
    inputType: InputType.TEXT,
    required: true,
    privacyRelevant: true,
    validationRegex: '^[A-Za-zÄÖÜäöüß\\-\\s]{2,50}$'
  },
  {
    id: 3,
    questionCode: 'q0002',
    category: Category.BASISDATEN,
    subcategory: 'Persönliche Informationen',
    label: 'Geschlecht',
    inputType: InputType.SINGLE_CHOICE,
    required: true,
    privacyRelevant: true,
    options: [
      { value: 1, label: 'männlich' },
      { value: 2, label: 'weiblich' },
      { value: 3, label: 'divers' }
    ]
  },
  {
    id: 4,
    questionCode: 'q0003',
    category: Category.BASISDATEN,
    subcategory: 'Persönliche Informationen',
    label: 'Geburtsdatum',
    inputType: InputType.DATE,
    required: true,
    privacyRelevant: true
  },
  {
    id: 10,
    questionCode: 'q1000',
    category: Category.BESCHWERDEN,
    subcategory: 'Aktuelle Beschwerden',
    label: 'Haben Sie aktuell Beschwerden?',
    inputType: InputType.YES_NO,
    required: true,
    privacyRelevant: false
  },
  {
    id: 11,
    questionCode: 'q1001',
    category: Category.BESCHWERDEN,
    subcategory: 'Beschwerde-Details',
    label: 'Seit wann haben Sie diese Beschwerden?',
    inputType: InputType.SINGLE_CHOICE,
    required: true,
    privacyRelevant: false,
    condition: {
      dependsOnContainer: 10,
      operator: '==',
      value: 1  // Ja
    },
    options: [
      { value: 1, label: 'Heute' },
      { value: 2, label: 'Seit gestern' },
      { value: 3, label: 'Seit einigen Tagen' },
      { value: 4, label: 'Seit einer Woche' },
      { value: 5, label: 'Seit mehreren Wochen' },
      { value: 6, label: 'Seit Monaten' },
      { value: 7, label: 'Länger als ein Jahr' }
    ]
  },
  {
    id: 12,
    questionCode: 'q1005',
    category: Category.BESCHWERDEN,
    subcategory: 'Begleitsymptome',
    label: 'Haben Sie zusätzliche Symptome?',
    inputType: InputType.MULTI_CHOICE,
    required: false,
    privacyRelevant: false,
    condition: {
      dependsOnContainer: 10,
      operator: '==',
      value: 1
    },
    options: [
      { value: 1, label: 'Fieber' },
      { value: 2, label: 'Übelkeit' },
      { value: 3, label: 'Erbrechen' },
      { value: 4, label: 'Schwindel' },
      { value: 5, label: 'Kraftlosigkeit' },
      { value: 6, label: 'ungewollter Gewichtsverlust' },
      { value: 7, label: 'Nachtschweiß' },
      { value: 8, label: 'Keine zusätzlichen Symptome' }
    ]
  }
];

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Für Browser (Global)
if (typeof window !== 'undefined') {
  window.QuestionContainer = QuestionContainer;
  window.AnswerRegistry = AnswerRegistry;
  window.QuestionCatalog = QuestionCatalog;
  window.InputType = InputType;
  window.Category = Category;
  window.CategoryNames = CategoryNames;
  window.generateReadableExport = generateReadableExport;
  window.generateGDTExport = generateGDTExport;
  window.EXAMPLE_QUESTIONS = EXAMPLE_QUESTIONS;
}

// Für Node.js/Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QuestionContainer,
    AnswerRegistry,
    QuestionCatalog,
    InputType,
    Category,
    CategoryNames,
    generateReadableExport,
    generateGDTExport,
    EXAMPLE_QUESTIONS
  };
}
