/**
 * Web Mock for react-native-keychain
 * Uses localStorage as fallback with security warning
 */

const KEYCHAIN_PREFIX = 'klaproth_keychain_';

export const SECURITY_LEVEL = {
  ANY: 'ANY',
  SECURE_SOFTWARE: 'SECURE_SOFTWARE',
  SECURE_HARDWARE: 'SECURE_HARDWARE',
};

export const setGenericPassword = async (
  username: string,
  password: string,
  options?: any
): Promise<false | { service: string }> => {
  try {
    console.warn(
      '[klaproth] Security Warning: Using localStorage for credentials. Not secure for production!'
    );
    
    const data = JSON.stringify({ username, password });
    localStorage.setItem(`${KEYCHAIN_PREFIX}generic`, data);
    
    return { service: 'generic' };
  } catch (error) {
    console.error('[klaproth] Keychain setGenericPassword error:', error);
    return false;
  }
};

export const getGenericPassword = async (
  options?: any
): Promise<false | { username: string; password: string; service: string }> => {
  try {
    const data = localStorage.getItem(`${KEYCHAIN_PREFIX}generic`);
    if (!data) return false;
    
    const parsed = JSON.parse(data);
    return {
      username: parsed.username,
      password: parsed.password,
      service: 'generic',
    };
  } catch (error) {
    console.error('[klaproth] Keychain getGenericPassword error:', error);
    return false;
  }
};

export const resetGenericPassword = async (options?: any): Promise<boolean> => {
  try {
    localStorage.removeItem(`${KEYCHAIN_PREFIX}generic`);
    return true;
  } catch (error) {
    console.error('[klaproth] Keychain resetGenericPassword error:', error);
    return false;
  }
};

export default {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  SECURITY_LEVEL,
};
