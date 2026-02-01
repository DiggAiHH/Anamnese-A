/**
 * Web Mock for react-native-document-picker
 * Uses browser File API
 */

export const types = {
  allFiles: '*/*',
  images: 'image/*',
  plainText: 'text/plain',
  audio: 'audio/*',
  pdf: 'application/pdf',
  zip: 'application/zip',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const pick = async (options?: {
  type?: string | string[];
  allowMultiSelection?: boolean;
  copyTo?: 'cachesDirectory' | 'documentDirectory';
}): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options?.allowMultiSelection || false;
    
    if (options?.type) {
      const acceptTypes = Array.isArray(options.type) ? options.type : [options.type];
      input.accept = acceptTypes.join(',');
    }

    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      
      const results = await Promise.all(
        files.map(async (file: File) => {
          const uri = URL.createObjectURL(file);
          
          return {
            uri,
            name: file.name,
            type: file.type,
            size: file.size,
            fileCopyUri: uri,
          };
        })
      );
      
      resolve(results);
    };

    input.onerror = () => {
      reject(new Error('Document picker cancelled'));
    };

    input.click();
  });
};

export const pickSingle = async (options?: {
  type?: string | string[];
  copyTo?: 'cachesDirectory' | 'documentDirectory';
}): Promise<any> => {
  const results = await pick({ ...options, allowMultiSelection: false });
  return results[0];
};

export const isCancel = (error: any): boolean => {
  return error?.message?.includes('cancelled');
};

export default {
  pick,
  pickSingle,
  types,
  isCancel,
};
