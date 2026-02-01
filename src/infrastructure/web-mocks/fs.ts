/**
 * Web Mock for react-native-fs
 * Uses browser File API and localStorage as fallback
 */

export const DocumentDirectoryPath = '/klaproth/documents';
export const CachesDirectoryPath = '/klaproth/cache';
export const ExternalDirectoryPath = '/klaproth/external';

const STORAGE_PREFIX = 'klaproth_fs_';

export const writeFile = async (
  filepath: string,
  contents: string,
  encoding?: string
): Promise<void> => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${filepath}`, contents);
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
};

export const readFile = async (
  filepath: string,
  encoding?: string
): Promise<string> => {
  try {
    const content = localStorage.getItem(`${STORAGE_PREFIX}${filepath}`);
    if (content === null) {
      throw new Error('File not found');
    }
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
};

export const exists = async (filepath: string): Promise<boolean> => {
  return localStorage.getItem(`${STORAGE_PREFIX}${filepath}`) !== null;
};

export const unlink = async (filepath: string): Promise<void> => {
  localStorage.removeItem(`${STORAGE_PREFIX}${filepath}`);
};

export const mkdir = async (filepath: string): Promise<void> => {
  // No-op for web, directories are virtual
  return Promise.resolve();
};

export const readDir = async (dirpath: string): Promise<any[]> => {
  const files: any[] = [];
  const prefix = `${STORAGE_PREFIX}${dirpath}`;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      files.push({
        name: key.replace(prefix, '').replace(/^\//, ''),
        path: key.replace(STORAGE_PREFIX, ''),
        size: (localStorage.getItem(key) || '').length,
        isFile: () => true,
        isDirectory: () => false,
      });
    }
  }
  
  return files;
};

export const downloadFile = async (options: {
  fromUrl: string;
  toFile: string;
}): Promise<{ jobId: number; promise: Promise<any> }> => {
  const jobId = Date.now();
  
  const promise = fetch(options.fromUrl)
    .then(response => response.text())
    .then(content => {
      localStorage.setItem(`${STORAGE_PREFIX}${options.toFile}`, content);
      return { jobId, statusCode: 200, bytesWritten: content.length };
    });
  
  return { jobId, promise };
};

export const stat = async (filepath: string): Promise<{ size: number }> => {
  const prefix = `${STORAGE_PREFIX}${filepath}`;
  let size = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(prefix) || key.startsWith(STORAGE_PREFIX)) {
      size += (localStorage.getItem(key) || '').length;
    }
  }

  return { size };
};

export default {
  DocumentDirectoryPath,
  CachesDirectoryPath,
  ExternalDirectoryPath,
  writeFile,
  readFile,
  exists,
  unlink,
  mkdir,
  readDir,
  downloadFile,
  stat,
};
