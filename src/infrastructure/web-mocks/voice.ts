/**
 * Web Mock for @react-native-voice/voice
 * Uses Web Speech API as fallback
 */

type SpeechResultsEvent = {
  value?: string[];
};

type SpeechErrorEvent = {
  error?: {
    message?: string;
  };
};

let recognition: any = null;
let isRecognizing = false;

const listeners: {
  [key: string]: Function[];
} = {};

const emit = (event: string, data?: any) => {
  if (listeners[event]) {
    listeners[event].forEach(callback => callback(data));
  }
};

export default {
  start: async (locale: string = 'de-DE'): Promise<void> => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[klaproth] Web Speech API not supported in this browser');
      emit('onSpeechError', { error: { message: 'Speech recognition not supported' } });
      return;
    }

    try {
      const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognitionCtor();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = locale;

      recognition.onresult = (event: any) => {
        const results = [];
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            results.push(event.results[i][0].transcript);
          }
        }
        
        if (results.length > 0) {
          emit('onSpeechResults', { value: results });
        }
      };

      recognition.onerror = (event: any) => {
        emit('onSpeechError', { error: { message: event.error } });
      };

      recognition.onend = () => {
        isRecognizing = false;
        emit('onSpeechEnd');
      };

      recognition.onstart = () => {
        isRecognizing = true;
        emit('onSpeechStart');
      };

      recognition.start();
    } catch (error) {
      console.error('[klaproth] Voice recognition start error:', error);
      emit('onSpeechError', { error: { message: String(error) } });
    }
  },

  stop: async (): Promise<void> => {
    if (recognition && isRecognizing) {
      recognition.stop();
      isRecognizing = false;
    }
  },

  cancel: async (): Promise<void> => {
    if (recognition) {
      recognition.abort();
      isRecognizing = false;
    }
  },

  destroy: async (): Promise<void> => {
    if (recognition) {
      recognition.abort();
      recognition = null;
      isRecognizing = false;
    }
  },

  removeAllListeners: (): void => {
    Object.keys(listeners).forEach(key => {
      listeners[key] = [];
    });
  },

  isAvailable: async (): Promise<boolean> => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  isRecognizing: (): boolean => {
    return isRecognizing;
  },

  onSpeechStart: (callback: Function) => {
    if (!listeners.onSpeechStart) listeners.onSpeechStart = [];
    listeners.onSpeechStart.push(callback);
  },

  onSpeechEnd: (callback: Function) => {
    if (!listeners.onSpeechEnd) listeners.onSpeechEnd = [];
    listeners.onSpeechEnd.push(callback);
  },

  onSpeechResults: (callback: (e: SpeechResultsEvent) => void) => {
    if (!listeners.onSpeechResults) listeners.onSpeechResults = [];
    listeners.onSpeechResults.push(callback);
  },

  onSpeechError: (callback: (e: SpeechErrorEvent) => void) => {
    if (!listeners.onSpeechError) listeners.onSpeechError = [];
    listeners.onSpeechError.push(callback);
  },
};
