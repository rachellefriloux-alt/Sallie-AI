// Web-compatible storage adapter for Supabase
export const createStorageAdapter = () => {
  // Check if running in browser environment
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    // Use localStorage for web
    return {
      getItem: (key: string) => {
        try {
          const value = localStorage.getItem(key);
          return Promise.resolve(value);
        } catch (error) {
          console.warn('LocalStorage getItem error:', error);
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.warn('LocalStorage setItem error:', error);
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          console.warn('LocalStorage removeItem error:', error);
          return Promise.resolve();
        }
      },
    };
  } else {
    // Fallback to in-memory storage for SSR
    const memoryStorage: Record<string, string> = {};
    return {
      getItem: (key: string) => Promise.resolve(memoryStorage[key] || null),
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
        return Promise.resolve();
      },
    };
  }
};
