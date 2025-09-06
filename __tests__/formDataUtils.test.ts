/*
 * Sallie 1.0 Module  
 * Persona: Tough love meets soul care.
 * Function: Tests for configurable form data utility.
 * Got it, love.
 */

import {
  createConfigurableForm,
  maybeMultipartFormRequestOptions,
  multipartFormRequestOptions,
  requiresMultipartForm,
  FormDataFormatConfig,
  FORMAT_PRESETS,
  DEFAULT_CONFIG,
  MaxDepthExceededError,
} from '../utils/formDataUtils';

// Mock FormData for testing
class MockFormData {
  private entries: Array<[string, any]> = [];

  append(key: string, value: any) {
    this.entries.push([key, value]);
  }

  get(key: string) {
    const entry = this.entries.find(([k]) => k === key);
    return entry ? entry[1] : null;
  }

  getAll(key: string) {
    return this.entries.filter(([k]) => k === key).map(([, v]) => v);
  }

  getAllEntries() {
    return this.entries;
  }
}

// Mock Response for testing
class MockResponse {
  async blob() {
    return new Blob(['mock response']);
  }
}

// Mock globals
(global as any).FormData = MockFormData;
(global as any).Response = MockResponse;

describe('formDataUtils', () => {
  describe('createConfigurableForm', () => {
    it('should handle primitive values with default config', async () => {
      const body = {
        name: 'John',
        age: 30,
        active: true,
      };

      const form = await createConfigurableForm(body) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['name', 'John']);
      expect(entries).toContainEqual(['age', '30']);
      expect(entries).toContainEqual(['active', 'true']);
    });

    it('should handle PHP-style array formatting (default)', async () => {
      const body = {
        tags: ['red', 'green', 'blue'],
        items: [{ id: 1 }, { id: 2 }],
      };

      const form = await createConfigurableForm(body) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['tags[]', 'red']);
      expect(entries).toContainEqual(['tags[]', 'green']);
      expect(entries).toContainEqual(['tags[]', 'blue']);
      expect(entries).toContainEqual(['items[][id]', '1']);
      expect(entries).toContainEqual(['items[][id]', '2']);
    });

    it('should handle PHP-style object formatting (default)', async () => {
      const body = {
        user: {
          name: 'John',
          profile: {
            age: 30,
            city: 'NYC',
          },
        },
      };

      const form = await createConfigurableForm(body) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[profile][age]', '30']);
      expect(entries).toContainEqual(['user[profile][city]', 'NYC']);
    });

    it('should handle Rails-style formatting', async () => {
      const body = {
        tags: ['red', 'green'],
        user: { name: 'John', age: 30 },
      };

      const form = await createConfigurableForm(body, FORMAT_PRESETS.rails) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['tags[0]', 'red']);
      expect(entries).toContainEqual(['tags[1]', 'green']);
      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[age]', '30']);
    });

    it('should handle dot notation formatting', async () => {
      const body = {
        tags: ['red', 'green'],
        user: { name: 'John', profile: { age: 30 } },
      };

      const form = await createConfigurableForm(body, FORMAT_PRESETS.dot) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['tags.0', 'red']);
      expect(entries).toContainEqual(['tags.1', 'green']);
      expect(entries).toContainEqual(['user.name', 'John']);
      expect(entries).toContainEqual(['user.profile.age', '30']);
    });

    it('should handle custom formatting', async () => {
      const config: FormDataFormatConfig = {
        style: 'custom',
        arrayFormatter: (key, index) => `${key}__${index}__`,
        objectFormatter: (key, prop) => `${key}--${prop}--`,
      };

      const body = {
        tags: ['red', 'green'],
        user: { name: 'John' },
      };

      const form = await createConfigurableForm(body, config) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['tags__0__', 'red']);
      expect(entries).toContainEqual(['tags__1__', 'green']);
      expect(entries).toContainEqual(['user--name--', 'John']);
    });

    it('should throw error for custom style without formatters', async () => {
      const config: FormDataFormatConfig = {
        style: 'custom',
      };

      const body = { tags: ['red'] };

      await expect(createConfigurableForm(body, config)).rejects.toThrow(
        'Custom formatters must be provided when using custom style'
      );
    });

    it('should handle empty arrays based on includeEmptyArrays config', async () => {
      const body = { tags: [] };

      // Default: don't include empty arrays
      const form1 = await createConfigurableForm(body) as any;
      expect(form1.getAllEntries()).toHaveLength(0);

      // Include empty arrays
      const form2 = await createConfigurableForm(body, { 
        ...DEFAULT_CONFIG, 
        includeEmptyArrays: true 
      }) as any;
      expect(form2.getAllEntries()).toHaveLength(0); // Still empty because no entries to add
    });

    it('should respect maxDepth configuration', async () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: 'deep value',
            },
          },
        },
      };

      const config: FormDataFormatConfig = {
        style: 'php',
        maxDepth: 2,
      };

      await expect(createConfigurableForm(deepObject, config)).rejects.toThrow(
        MaxDepthExceededError
      );
    });

    it('should handle null values with proper error', async () => {
      const body = { nullValue: null };

      await expect(createConfigurableForm(body)).rejects.toThrow(
        'Received null for "nullValue"; to pass null in FormData, you must use the string \'null\''
      );
    });

    it('should handle undefined values by skipping them', async () => {
      const body = {
        defined: 'value',
        undefined: undefined,
      };

      const form = await createConfigurableForm(body) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['defined', 'value']);
      expect(entries.find(([key]: [string, any]) => key === 'undefined')).toBeUndefined();
    });

    it('should handle File objects', async () => {
      // Mock File object
      const mockFile = new (class extends Blob {
        name = 'test.txt';
        constructor() {
          super(['test content'], { type: 'text/plain' });
        }
      })();

      const body = { file: mockFile };
      const form = await createConfigurableForm(body) as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['file', mockFile]);
    });

    it('should handle Response objects', async () => {
      const mockResponse = new (global as any).Response();
      const body = { response: mockResponse };
      const form = await createConfigurableForm(body) as any;
      const entries = form.getAllEntries();

      expect(entries.some(([key, value]: [string, any]) => key === 'response' && value instanceof Blob)).toBe(true);
    });

    it('should throw error for invalid value types', async () => {
      const body = { 
        func: () => 'function',
        symbol: Symbol('test'),
      };

      await expect(createConfigurableForm(body)).rejects.toThrow(
        /Invalid value given to form/
      );
    });
  });

  describe('requiresMultipartForm', () => {
    it('should return false for simple objects', () => {
      const body = { name: 'John', age: 30 };
      expect(requiresMultipartForm(body)).toBe(false);
    });

    it('should return true for objects with File', () => {
      const mockFile = new Blob(['content']);
      const body = { file: mockFile };
      expect(requiresMultipartForm(body)).toBe(true);
    });

    it('should return true for nested objects with uploadable content', () => {
      const mockFile = new Blob(['content']);
      const body = { 
        data: { 
          nested: { 
            file: mockFile 
          } 
        } 
      };
      expect(requiresMultipartForm(body)).toBe(true);
    });

    it('should return true for arrays with uploadable content', () => {
      const mockFile = new Blob(['content']);
      const body = { files: [mockFile] };
      expect(requiresMultipartForm(body)).toBe(true);
    });
  });

  describe('maybeMultipartFormRequestOptions', () => {
    it('should return original options for non-multipart data', async () => {
      const opts = {
        method: 'POST',
        body: { name: 'John' },
        headers: { 'Custom-Header': 'value' },
      };

      const result = await maybeMultipartFormRequestOptions(opts);
      expect(result).toBe(opts); // Same reference
    });

    it('should convert to multipart for uploadable data', async () => {
      const mockFile = new Blob(['content']);
      const opts = {
        method: 'POST',
        body: { file: mockFile },
      };

      const result = await maybeMultipartFormRequestOptions(opts);
      
      expect(result).not.toBe(opts); // Different reference
      expect(result.method).toBe('POST');
      expect(result.body).toBeInstanceOf(MockFormData);
    });
  });

  describe('multipartFormRequestOptions', () => {
    it('should always convert to multipart form', async () => {
      const opts = {
        method: 'POST',
        body: { name: 'John' },
      };

      const result = await multipartFormRequestOptions(opts);
      
      expect(result).not.toBe(opts);
      expect(result.method).toBe('POST');
      expect(result.body).toBeInstanceOf(MockFormData);
    });

    it('should use custom configuration', async () => {
      const opts = {
        body: { tags: ['red', 'green'] },
      };

      const result = await multipartFormRequestOptions(opts, FORMAT_PRESETS.rails);
      const form = result.body as any;
      const entries = form.getAllEntries();

      expect(entries).toContainEqual(['tags[0]', 'red']);
      expect(entries).toContainEqual(['tags[1]', 'green']);
    });
  });

  describe('MaxDepthExceededError', () => {
    it('should create error with correct message and name', () => {
      const error = new MaxDepthExceededError(5);
      expect(error.message).toBe('Maximum nesting depth of 5 exceeded');
      expect(error.name).toBe('MaxDepthExceededError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('FORMAT_PRESETS', () => {
    it('should provide correct preset configurations', () => {
      expect(FORMAT_PRESETS.php).toEqual({ style: 'php' });
      expect(FORMAT_PRESETS.rails).toEqual({ style: 'rails' });
      expect(FORMAT_PRESETS.dot).toEqual({ style: 'dot' });
    });
  });
});