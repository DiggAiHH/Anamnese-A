/**
 * Web Mock for react-native-tesseract-ocr
 * Returns empty text to keep Web build stable.
 */

export const LANG_ENGLISH = 'eng';
export const LANG_GERMAN = 'deu';

const TesseractOcr = {
  recognize: async (_imagePath: string, _language?: string, _options?: Record<string, unknown>) => {
    return '';
  },
};

export default TesseractOcr;
