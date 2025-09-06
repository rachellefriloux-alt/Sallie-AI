/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for configurable form data utilities.
 * Got it, love.
 */

import {
  addFormValue,
  createForm,
  createFormWithArrayFormat,
  createFormWithObjectFormat,
  NestedFormatConfig,
  DEFAULT_NESTED_FORMAT_CONFIG,
  NESTED_FORMAT_PRESETS,
  isUploadable,
  hasUploadableValue,
  getName,
  checkFormDataSupport,
  parseFormData,
} from '../utils/formDataUtils';

// Mock FormData for testing
class MockFormData {
  private entries: Array<[string, any]> = [];

  append(key: string, value: any, filename?: string) {
    this.entries.push([key, filename ? { value, filename } : value]);
  }

  get(key: string): any {
    const entry = this.entries.find(([k]) => k === key);
    return entry ? entry[1] : null;
  }

  getAll(key: string): any[] {
    return this.entries.filter(([k]) => k === key).map(([, v]) => v);
  }

  *[Symbol.iterator]() {
    for (const entry of this.entries) {
      yield entry;
    }
  }

  entries() {
    return this.entries[Symbol.iterator]();
  }

  getEntries() {
    return [...this.entries];
  }
}

// Replace global FormData with our mock
(global as any).FormData = MockFormData;

describe('FormData Utils', () => {
  let form: MockFormData;

  beforeEach(() => {
    form = new MockFormData();
  });

  describe('Basic functionality', () => {
    it('should handle primitive values', async () => {
      await addFormValue(form, 'string', 'test');
      await addFormValue(form, 'number', 42);
      await addFormValue(form, 'boolean', true);

      expect(form.get('string')).toBe('test');
      expect(form.get('number')).toBe('42');
      expect(form.get('boolean')).toBe('true');
    });

    it('should throw error for null values', async () => {
      await expect(addFormValue(form, 'test', null))
        .rejects
        .toThrow('Received null for "test"; to pass null in FormData, you must use the string \'null\'');
    });

    it('should ignore undefined values', async () => {
      await addFormValue(form, 'test', undefined);
      expect(form.get('test')).toBeNull();
    });

    it('should throw error for invalid types', async () => {
      const symbol = Symbol('test');
      await expect(addFormValue(form, 'test', symbol))
        .rejects
        .toThrow('Invalid value given to form');
    });
  });

  describe('Array formats', () => {
    const testArray = ['a', 'b', 'c'];

    it('should use indices format', async () => {
      const config: NestedFormatConfig = { ...DEFAULT_NESTED_FORMAT_CONFIG, arrayFormat: 'indices' };
      await addFormValue(form, 'arr', testArray, config);

      expect(form.get('arr[0]')).toBe('a');
      expect(form.get('arr[1]')).toBe('b');
      expect(form.get('arr[2]')).toBe('c');
    });

    it('should use brackets format (default)', async () => {
      await addFormValue(form, 'arr', testArray);

      expect(form.getAll('arr[]')).toEqual(['a', 'b', 'c']);
    });

    it('should use repeat format', async () => {
      const config: NestedFormatConfig = { ...DEFAULT_NESTED_FORMAT_CONFIG, arrayFormat: 'repeat' };
      await addFormValue(form, 'arr', testArray, config);

      expect(form.getAll('arr')).toEqual(['a', 'b', 'c']);
    });

    it('should use comma format', async () => {
      const config: NestedFormatConfig = { ...DEFAULT_NESTED_FORMAT_CONFIG, arrayFormat: 'comma' };
      await addFormValue(form, 'arr', testArray, config);

      expect(form.get('arr')).toBe('a,b,c');
    });

    it('should use comma format with custom delimiter', async () => {
      const config: NestedFormatConfig = { 
        ...DEFAULT_NESTED_FORMAT_CONFIG, 
        arrayFormat: 'comma',
        arrayDelimiter: ';'
      };
      await addFormValue(form, 'arr', testArray, config);

      expect(form.get('arr')).toBe('a;b;c');
    });

    it('should use comma format with round trip for single items', async () => {
      const config: NestedFormatConfig = { 
        ...DEFAULT_NESTED_FORMAT_CONFIG, 
        arrayFormat: 'comma',
        commaRoundTrip: true
      };
      await addFormValue(form, 'arr', ['single'], config);

      expect(form.get('arr[]')).toBe('single');
    });

    it('should handle empty arrays', async () => {
      await addFormValue(form, 'arr', []);
      expect(form.getEntries().length).toBe(0);
    });
  });

  describe('Object formats', () => {
    const testObject = { name: 'John', age: 30 };

    it('should use brackets format (default)', async () => {
      await addFormValue(form, 'obj', testObject);

      expect(form.get('obj[name]')).toBe('John');
      expect(form.get('obj[age]')).toBe('30');
    });

    it('should use dots format', async () => {
      const config: NestedFormatConfig = { ...DEFAULT_NESTED_FORMAT_CONFIG, objectFormat: 'dots' };
      await addFormValue(form, 'obj', testObject, config);

      expect(form.get('obj.name')).toBe('John');
      expect(form.get('obj.age')).toBe('30');
    });

    it('should encode dots in keys when using brackets format', async () => {
      const config: NestedFormatConfig = { 
        ...DEFAULT_NESTED_FORMAT_CONFIG, 
        objectFormat: 'brackets',
        encodeDotInKeys: true
      };
      const objWithDots = { 'field.name': 'value' };
      await addFormValue(form, 'obj', objWithDots, config);

      expect(form.get('obj[field%2Ename]')).toBe('value');
    });

    it('should handle empty objects', async () => {
      await addFormValue(form, 'obj', {});
      expect(form.getEntries().length).toBe(0);
    });
  });

  describe('Nested structures', () => {
    it('should handle nested objects', async () => {
      const nested = {
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark'
            }
          }
        }
      };

      await addFormValue(form, 'data', nested);

      expect(form.get('data[user][profile][name]')).toBe('John');
      expect(form.get('data[user][profile][settings][theme]')).toBe('dark');
    });

    it('should handle nested objects with dots format', async () => {
      const config: NestedFormatConfig = { ...DEFAULT_NESTED_FORMAT_CONFIG, objectFormat: 'dots' };
      const nested = {
        user: {
          profile: {
            name: 'John'
          }
        }
      };

      await addFormValue(form, 'data', nested, config);

      expect(form.get('data.user.profile.name')).toBe('John');
    });

    it('should handle arrays of objects', async () => {
      const arrayOfObjects = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];

      await addFormValue(form, 'users', arrayOfObjects);

      expect(form.get('users[][name]')).toBe('John');
      expect(form.get('users[][age]')).toBe('30');
    });

    it('should handle objects with arrays', async () => {
      const objectWithArrays = {
        tags: ['tag1', 'tag2'],
        metadata: {
          categories: ['cat1', 'cat2']
        }
      };

      await addFormValue(form, 'data', objectWithArrays);

      expect(form.getAll('data[tags][]')).toEqual(['tag1', 'tag2']);
      expect(form.getAll('data[metadata][categories][]')).toEqual(['cat1', 'cat2']);
    });
  });

  describe('File handling', () => {
    it('should detect uploadable values', () => {
      const file = new File(['content'], 'test.txt');
      const blob = new Blob(['content']);
      const response = new Response('content');

      expect(isUploadable(file)).toBe(true);
      expect(isUploadable(blob)).toBe(true);
      expect(isUploadable(response)).toBe(true);
      expect(isUploadable('string')).toBe(false);
      expect(isUploadable(null)).toBe(false);
    });

    it('should detect objects with uploadable values', () => {
      const file = new File(['content'], 'test.txt');
      
      expect(hasUploadableValue(file)).toBe(true);
      expect(hasUploadableValue([file])).toBe(true);
      expect(hasUploadableValue({ attachment: file })).toBe(true);
      expect(hasUploadableValue({ nested: { file } })).toBe(true);
      expect(hasUploadableValue('string')).toBe(false);
      expect(hasUploadableValue(['string'])).toBe(false);
    });

    it('should extract names from different value types', () => {
      expect(getName({ name: 'test.txt' })).toBe('test.txt');
      expect(getName({ url: 'path/to/test.txt' })).toBe('test.txt');
      expect(getName({ filename: 'folder\\test.txt' })).toBe('test.txt');
      expect(getName({ path: '/full/path/test.txt' })).toBe('test.txt');
      expect(getName('string')).toBeUndefined();
      expect(getName({})).toBeUndefined();
    });
  });

  describe('Preset configurations', () => {
    it('should use PHP indexed preset', async () => {
      const data = {
        items: ['a', 'b'],
        meta: { count: 2 }
      };

      const form = await createForm(data, NESTED_FORMAT_PRESETS.PHP_INDEXED);
      const entries = form.getEntries();

      expect(entries).toContainEqual(['items[0]', 'a']);
      expect(entries).toContainEqual(['items[1]', 'b']);
      expect(entries).toContainEqual(['meta[count]', '2']);
    });

    it('should use dot notation preset', async () => {
      const data = {
        user: { name: 'John' },
        tags: ['a', 'b']
      };

      const form = await createForm(data, NESTED_FORMAT_PRESETS.DOT_NOTATION);
      const entries = form.getEntries();

      expect(entries).toContainEqual(['user.name', 'John']);
      expect(entries).toContainEqual(['tags[]', 'a']);
      expect(entries).toContainEqual(['tags[]', 'b']);
    });

    it('should use comma separated preset', async () => {
      const data = {
        tags: ['a', 'b', 'c'],
        meta: { id: 1 }
      };

      const form = await createForm(data, NESTED_FORMAT_PRESETS.COMMA_SEPARATED);
      const entries = form.getEntries();

      expect(entries).toContainEqual(['tags', 'a,b,c']);
      expect(entries).toContainEqual(['meta[id]', '1']);
    });
  });

  describe('Convenience functions', () => {
    it('should create form with specific array format', async () => {
      const data = { items: ['a', 'b'] };
      
      const form = await createFormWithArrayFormat(data, 'indices');
      const entries = form.getEntries();

      expect(entries).toContainEqual(['items[0]', 'a']);
      expect(entries).toContainEqual(['items[1]', 'b']);
    });

    it('should create form with specific object format', async () => {
      const data = { user: { name: 'John' } };
      
      const form = await createFormWithObjectFormat(data, 'dots');
      const entries = form.getEntries();

      expect(entries).toContainEqual(['user.name', 'John']);
    });
  });

  describe('Utility functions', () => {
    it('should check FormData support', () => {
      expect(checkFormDataSupport()).toBe(true);
    });

    it('should parse FormData back to object (basic)', () => {
      form.append('simple', 'value');
      form.append('obj[name]', 'John');
      form.append('obj[age]', '30');
      form.append('arr[]', 'a');
      form.append('arr[]', 'b');

      // Use the mock's getEntries method instead
      const mockFormDataWithEntries = {
        entries: () => form.getEntries()[Symbol.iterator]()
      };

      const parsed = parseFormData(mockFormDataWithEntries as any);

      expect(parsed.simple).toBe('value');
      expect(parsed.obj.name).toBe('John');
      expect(parsed.obj.age).toBe('30');
      expect(parsed.arr).toEqual(['a', 'b']);
    });
  });

  describe('Error handling', () => {
    it('should handle async errors gracefully', async () => {
      const problematicData = {
        func: () => 'function'
      };

      await expect(addFormValue(form, 'test', problematicData))
        .rejects
        .toThrow('Invalid value given to form');
    });

    it('should maintain original error types', async () => {
      try {
        await addFormValue(form, 'test', null);
      } catch (error: any) {
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toContain('null');
      }
    });
  });

  describe('Configuration validation', () => {
    it('should use default config when invalid format provided', async () => {
      const invalidConfig = {
        arrayFormat: 'invalid' as any,
        objectFormat: 'invalid' as any
      };

      // Should fallback to default behavior without throwing
      await addFormValue(form, 'arr', ['a'], invalidConfig);
      await addFormValue(form, 'obj', { key: 'value' }, invalidConfig);

      expect(form.get('arr[]')).toBe('a');
      expect(form.get('obj[key]')).toBe('value');
    });

    it('should handle missing config properties', async () => {
      const partialConfig = {
        arrayFormat: 'indices' as const
        // missing objectFormat
      };

      await addFormValue(form, 'data', { arr: ['a'], obj: { key: 'value' } }, partialConfig);

      expect(form.get('data[arr][0]')).toBe('a');
      expect(form.get('data[obj][key]')).toBe('value');
    });
  });
});