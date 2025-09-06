/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for configurable upload utility with nested formats.
 * Got it, love.
 */

import {
  addFormValue,
  createForm,
  makeFile,
  getName,
  maybeMultipartFormRequestOptions,
  multipartFormRequestOptions,
  NestedFormatOptions,
  DEFAULT_FORMAT_OPTIONS,
} from '../utils/uploadUtils';

// Mock File constructor for Node.js environment
if (typeof File === 'undefined') {
  (global as any).File = class File {
    name: string;
    type: string;
    size: number;
    lastModified: number;

    constructor(fileBits: any[], fileName: string, options?: any) {
      this.name = fileName;
      this.type = options?.type || '';
      this.size = 0;
      this.lastModified = Date.now();
    }
  };
}

// Mock FormData for testing
class MockFormData {
  private entries: Array<[string, any]> = [];

  append(name: string, value: any, filename?: string) {
    this.entries.push([name, value]);
  }

  getEntries() {
    return this.entries;
  }

  has(name: string) {
    return this.entries.some(([key]) => key === name);
  }

  get(name: string) {
    const entry = this.entries.find(([key]) => key === name);
    return entry ? entry[1] : null;
  }
}

// Replace global FormData with mock for testing
(global as any).FormData = MockFormData;

describe('Upload Utils - Configurable Nested Formats', () => {
  let mockForm: MockFormData;

  beforeEach(() => {
    mockForm = new MockFormData();
  });

  describe('makeFile', () => {
    it('should create a file with proper name', () => {
      const file = makeFile(['test content'], 'test.txt', { type: 'text/plain' });
      expect(file.name).toBe('test.txt');
      expect(file.type).toBe('text/plain');
    });

    it('should use default name when fileName is undefined', () => {
      const file = makeFile(['test content'], undefined);
      expect(file.name).toBe('unknown_file');
    });
  });

  describe('getName', () => {
    it('should extract name from objects with name property', () => {
      expect(getName({ name: 'test.txt' })).toBe('test.txt');
    });

    it('should extract filename from path', () => {
      expect(getName({ path: '/some/path/file.pdf' })).toBe('file.pdf');
      expect(getName({ path: 'C:\\Users\\test\\document.docx' })).toBe('document.docx');
    });

    it('should extract name from url', () => {
      expect(getName({ url: 'https://example.com/files/image.jpg' })).toBe('image.jpg');
    });

    it('should return undefined for objects without valid properties', () => {
      expect(getName({})).toBeUndefined();
      expect(getName({ invalid: 'prop' })).toBeUndefined();
    });
  });

  describe('addFormValue - Array Formatting', () => {
    it('should format arrays with brackets strategy (default)', async () => {
      const testArray = ['item1', 'item2', 'item3'];
      await addFormValue(mockForm as any, 'items', testArray);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0]).toEqual(['items[]', 'item1']);
      expect(entries[1]).toEqual(['items[]', 'item2']);
      expect(entries[2]).toEqual(['items[]', 'item3']);
    });

    it('should format arrays with indices strategy', async () => {
      const testArray = ['item1', 'item2'];
      const options: NestedFormatOptions = { arrayFormat: 'indices' };
      
      await addFormValue(mockForm as any, 'items', testArray, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(['items[0]', 'item1']);
      expect(entries[1]).toEqual(['items[1]', 'item2']);
    });

    it('should format arrays with dots strategy', async () => {
      const testArray = ['item1', 'item2'];
      const options: NestedFormatOptions = { arrayFormat: 'dots' };
      
      await addFormValue(mockForm as any, 'items', testArray, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(['items.0', 'item1']);
      expect(entries[1]).toEqual(['items.1', 'item2']);
    });

    it('should format arrays with underscores strategy', async () => {
      const testArray = ['item1', 'item2'];
      const options: NestedFormatOptions = { arrayFormat: 'underscores' };
      
      await addFormValue(mockForm as any, 'items', testArray, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(['items_0', 'item1']);
      expect(entries[1]).toEqual(['items_1', 'item2']);
    });

    it('should format arrays with custom formatter', async () => {
      const testArray = ['item1', 'item2'];
      const options: NestedFormatOptions = { 
        arrayFormat: 'custom',
        customArrayFormatter: (key, index) => `${key}__${index}__`
      };
      
      await addFormValue(mockForm as any, 'items', testArray, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual(['items__0__', 'item1']);
      expect(entries[1]).toEqual(['items__1__', 'item2']);
    });
  });

  describe('addFormValue - Object Formatting', () => {
    it('should format objects with brackets strategy (default)', async () => {
      const testObject = { name: 'John', age: 30 };
      await addFormValue(mockForm as any, 'user', testObject);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[age]', '30']);
    });

    it('should format objects with dots strategy', async () => {
      const testObject = { name: 'John', age: 30 };
      const options: NestedFormatOptions = { objectFormat: 'dots' };
      
      await addFormValue(mockForm as any, 'user', testObject, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['user.name', 'John']);
      expect(entries).toContainEqual(['user.age', '30']);
    });

    it('should format objects with underscores strategy', async () => {
      const testObject = { name: 'John', age: 30 };
      const options: NestedFormatOptions = { objectFormat: 'underscores' };
      
      await addFormValue(mockForm as any, 'user', testObject, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['user_name', 'John']);
      expect(entries).toContainEqual(['user_age', '30']);
    });

    it('should format objects with custom formatter', async () => {
      const testObject = { name: 'John', age: 30 };
      const options: NestedFormatOptions = { 
        objectFormat: 'custom',
        customObjectFormatter: (key, prop) => `${key}::${prop}::`
      };
      
      await addFormValue(mockForm as any, 'user', testObject, options);

      const entries = mockForm.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['user::name::', 'John']);
      expect(entries).toContainEqual(['user::age::', '30']);
    });
  });

  describe('addFormValue - Nested Structures', () => {
    it('should handle nested arrays and objects', async () => {
      const nestedData = {
        users: [
          { name: 'John', tags: ['admin', 'user'] },
          { name: 'Jane', tags: ['user'] }
        ]
      };

      await addFormValue(mockForm as any, 'data', nestedData);

      const entries = mockForm.getEntries();
      expect(entries).toContainEqual(['data[users][][name]', 'John']);
      expect(entries).toContainEqual(['data[users][][tags][]', 'admin']);
      expect(entries).toContainEqual(['data[users][][tags][]', 'user']);
      expect(entries).toContainEqual(['data[users][][name]', 'Jane']);
      expect(entries).toContainEqual(['data[users][][tags][]', 'user']);
    });

    it('should respect max depth setting', async () => {
      const deeplyNested = { a: { b: { c: { d: { e: 'too deep' } } } } };
      const options: NestedFormatOptions = { maxDepth: 3 };

      await expect(
        addFormValue(mockForm as any, 'data', deeplyNested, options)
      ).rejects.toThrow('Maximum nesting depth of 3 exceeded');
    });
  });

  describe('addFormValue - Primitive Values', () => {
    it('should handle string values', async () => {
      await addFormValue(mockForm as any, 'name', 'John Doe');
      expect(mockForm.getEntries()).toContainEqual(['name', 'John Doe']);
    });

    it('should handle number values', async () => {
      await addFormValue(mockForm as any, 'age', 30);
      expect(mockForm.getEntries()).toContainEqual(['age', '30']);
    });

    it('should handle boolean values', async () => {
      await addFormValue(mockForm as any, 'active', true);
      expect(mockForm.getEntries()).toContainEqual(['active', 'true']);
    });

    it('should skip undefined values', async () => {
      await addFormValue(mockForm as any, 'optional', undefined);
      expect(mockForm.getEntries()).toHaveLength(0);
    });

    it('should throw error for null values', async () => {
      await expect(
        addFormValue(mockForm as any, 'required', null)
      ).rejects.toThrow('Received null for "required"');
    });
  });

  describe('addFormValue - Key Encoding', () => {
    it('should encode keys when encodeKeys is true', async () => {
      const testObject = { 'special key': 'value' };
      const options: NestedFormatOptions = { encodeKeys: true };
      
      await addFormValue(mockForm as any, 'data with spaces', testObject, options);

      const entries = mockForm.getEntries();
      expect(entries[0][0]).toBe('data%20with%20spaces[special%20key]');
    });

    it('should not encode keys by default', async () => {
      const testObject = { 'special key': 'value' };
      
      await addFormValue(mockForm as any, 'data with spaces', testObject);

      const entries = mockForm.getEntries();
      expect(entries[0][0]).toBe('data with spaces[special key]');
    });
  });

  describe('createForm', () => {
    it('should create form from simple object', async () => {
      const body = { name: 'John', age: 30 };
      const form = await createForm(body);

      expect(form).toBeInstanceOf(MockFormData);
      const entries = (form as any).getEntries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['name', 'John']);
      expect(entries).toContainEqual(['age', '30']);
    });

    it('should handle empty or undefined body', async () => {
      const emptyForm = await createForm(undefined);
      expect((emptyForm as any).getEntries()).toHaveLength(0);

      const emptyForm2 = await createForm({});
      expect((emptyForm2 as any).getEntries()).toHaveLength(0);
    });

    it('should use provided format options', async () => {
      const body = { items: ['a', 'b'] };
      const options: NestedFormatOptions = { arrayFormat: 'indices' };
      
      const form = await createForm(body, options);
      const entries = (form as any).getEntries();
      
      expect(entries).toContainEqual(['items[0]', 'a']);
      expect(entries).toContainEqual(['items[1]', 'b']);
    });
  });

  describe('maybeMultipartFormRequestOptions', () => {
    it('should return original options when no uploadable values', async () => {
      const opts = { body: { name: 'John', age: 30 } };
      const result = await maybeMultipartFormRequestOptions(opts);
      
      expect(result).toBe(opts);
      expect(result.body).toEqual({ name: 'John', age: 30 });
    });

    it('should create form data when uploadable values present', async () => {
      const file = makeFile(['content'], 'test.txt');
      const opts = { body: { file, name: 'John' } };
      
      const result = await maybeMultipartFormRequestOptions(opts);
      
      expect(result.body).toBeInstanceOf(MockFormData);
      expect(result.body).not.toBe(opts.body);
    });
  });

  describe('multipartFormRequestOptions', () => {
    it('should always create form data', async () => {
      const opts = { body: { name: 'John', age: 30 } };
      const result = await multipartFormRequestOptions(opts);
      
      expect(result.body).toBeInstanceOf(MockFormData);
      const entries = (result.body as any).getEntries();
      expect(entries).toContainEqual(['name', 'John']);
      expect(entries).toContainEqual(['age', '30']);
    });

    it('should use provided format options', async () => {
      const opts = { body: { items: ['a', 'b'] } };
      const formatOptions: NestedFormatOptions = { arrayFormat: 'dots' };
      
      const result = await multipartFormRequestOptions(opts, formatOptions);
      const entries = (result.body as any).getEntries();
      
      expect(entries).toContainEqual(['items.0', 'a']);
      expect(entries).toContainEqual(['items.1', 'b']);
    });
  });

  describe('DEFAULT_FORMAT_OPTIONS', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_FORMAT_OPTIONS.arrayFormat).toBe('brackets');
      expect(DEFAULT_FORMAT_OPTIONS.objectFormat).toBe('brackets');
      expect(DEFAULT_FORMAT_OPTIONS.maxDepth).toBe(10);
      expect(DEFAULT_FORMAT_OPTIONS.encodeKeys).toBe(false);
    });
  });
});