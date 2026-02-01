/**
 * Web Mock for react-native-share
 * Uses Web Share API with fallback
 */

export const open = async (options: {
  title?: string;
  message?: string;
  url?: string;
  urls?: string[];
  type?: string;
  filename?: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    // Check if Web Share API is available
    if (navigator.share) {
      const shareData: any = {};
      
      if (options.title) shareData.title = options.title;
      if (options.message) shareData.text = options.message;
      if (options.url) shareData.url = options.url;
      
      await navigator.share(shareData);
      return { success: true };
    } else {
      // Fallback: Copy to clipboard or download
      console.warn('[klaproth] Web Share API not available, using fallback');
      
      if (options.message) {
        await navigator.clipboard.writeText(options.message);
        alert('Text wurde in die Zwischenablage kopiert');
        return { success: true, message: 'Copied to clipboard' };
      }
      
      if (options.url) {
        window.open(options.url, '_blank');
        return { success: true, message: 'Opened in new tab' };
      }
      
      return { success: false, message: 'No shareable content provided' };
    }
  } catch (error: any) {
    console.error('[klaproth] Share error:', error);
    return { success: false, message: error.message };
  }
};

export const shareSingle = async (options: any): Promise<any> => {
  return open(options);
};

export default {
  open,
  shareSingle,
};
