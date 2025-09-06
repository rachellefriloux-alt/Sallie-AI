/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for configurable form data utility.
 * Got it, love.
 */

import {
  addFormValue,
  createConfigurableForm,
  createFormWithPreset,
  hasUploadableValue,
  DEFAULT_FORMAT_CONFIG,
  FORMAT_PRESETS,
  NestedFormatConfig,
} from '../utils/configurableFormData';

describe('Configurable Form Data Utility', () => {
  beforeEach(() => {
    // Mock FormData if not available in test environment
    if (typeof FormData === 'undefined') {
      global.FormData = class FormData {
        private data: Map<string, string | File> = new Map();
        
        append(key: string, value: string | File, filename?: string) {
          this.data.set(key, value);
        }
        
        get(key: string) {
          return this.data.get(key);
        }
        
        getAll(key: string) {
          return [this.data.get(key)].filter(Boolean);
        }
        
        entries() {
          return this.data.entries();
        }
      } as any;
    }
  });

  describe('addFormValue', () => {
    let form: FormData;

    beforeEach(() => {
      form = new FormData();
    });

    it('should handle primitive values', async () => {
      await addFormValue(form, 'name', 'John Doe');
      await addFormValue(form, 'age', 30);
      await addFormValue(form, 'active', true);

      expect(form.get('name')).toBe('John Doe');
      expect(form.get('age')).toBe('30');
      expect(form.get('active')).toBe('true');
    });

    it('should skip undefined values', async () => {
      await addFormValue(form, 'undefined', undefined);
      expect(form.get('undefined')).toBeNull();
    });

    it('should throw error for null values', async () => {
      await expect(addFormValue(form, 'null', null)).rejects.toThrow(
        'Received null for "null"; to pass null in FormData, you must use the string \'null\''
      );
    });

    it('should handle arrays with default (brackets) format', async () => {
      await addFormValue(form, 'items', ['apple', 'banana', 'cherry']);
      
      expect(form.get('items[]')).toBe('apple');
      expect(form.getAll('items[]')).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should handle arrays with indexed format', async () => {
      const config: NestedFormatConfig = {
        arrayFormat: 'indexed',
        objectFormat: 'dot',
        objectSeparator: '.',
      };
      
      await addFormValue(form, 'items', ['apple', 'banana'], config);
      
      expect(form.get('items.0')).toBe('apple');
      expect(form.get('items.1')).toBe('banana');
    });

    it('should handle arrays with comma format', async () => {
      const config: NestedFormatConfig = {
        arrayFormat: 'comma',
        objectFormat: 'brackets',
        arraySeparator: ',',
      };
      
      await addFormValue(form, 'tags', ['red', 'blue', 'green'], config);
      
      expect(form.get('tags')).toBe('red,blue,green');
    });

    it('should handle objects with default (brackets) format', async () => {
      await addFormValue(form, 'user', { name: 'John', age: 30 });
      
      expect(form.get('user[name]')).toBe('John');
      expect(form.get('user[age]')).toBe('30');
    });

    it('should handle objects with dot notation format', async () => {
      const config: NestedFormatConfig = {
        arrayFormat: 'brackets',
        objectFormat: 'dot',
      };
      
      await addFormValue(form, 'user', { name: 'John', age: 30 }, config);
      
      expect(form.get('user.name')).toBe('John');
      expect(form.get('user.age')).toBe('30');
    });

    it('should handle objects with underscore format', async () => {
      const config: NestedFormatConfig = {
        arrayFormat: 'brackets',
        objectFormat: 'underscore',
      };
      
      await addFormValue(form, 'user', { name: 'John', age: 30 }, config);
      
      expect(form.get('user_name')).toBe('John');
      expect(form.get('user_age')).toBe('30');
    });

    it('should handle nested objects and arrays', async () => {
      const data = {
        users: [
          { name: 'John', preferences: { theme: 'dark' } },
          { name: 'Jane', preferences: { theme: 'light' } }
        ]
      };
      
      await addFormValue(form, 'data', data);
      
      expect(form.get('data[users][][name]')).toBeTruthy();
      expect(form.get('data[users][][preferences][theme]')).toBeTruthy();
    });

    it('should throw error for unsupported types', async () => {
      const symbol = Symbol('test');
      await expect(addFormValue(form, 'symbol', symbol)).rejects.toThrow(
        'Invalid value given to form'
      );
    });
  });

  describe('createConfigurableForm', () => {
    it('should create form data with default config', async () => {
      const body = {
        name: 'John',
        items: ['apple', 'banana'],
        user: { age: 30, active: true }
      };
      
      const form = await createConfigurableForm(body);
      
      expect(form.get('name')).toBe('John');
      expect(form.getAll('items[]')).toEqual(['apple', 'banana']);
      expect(form.get('user[age]')).toBe('30');
      expect(form.get('user[active]')).toBe('true');
    });

    it('should handle empty body', async () => {
      const form = await createConfigurableForm(undefined);
      expect(form).toBeInstanceOf(FormData);
    });

    it('should use custom config', async () => {
      const body = {
        items: ['a', 'b'],
        user: { name: 'John' }
      };
      
      const config: NestedFormatConfig = {
        arrayFormat: 'indexed',
        objectFormat: 'dot',
        objectSeparator: '.',
      };
      
      const form = await createConfigurableForm(body, config);
      
      expect(form.get('items.0')).toBe('a');
      expect(form.get('items.1')).toBe('b');
      expect(form.get('user.name')).toBe('John');
    });
  });

  describe('createFormWithPreset', () => {
    it('should create form data with rails preset', async () => {
      const body = {
        items: ['apple', 'banana'],
        user: { name: 'John' }
      };
      
      const form = await createFormWithPreset(body, 'rails');
      
      expect(form.getAll('items[]')).toEqual(['apple', 'banana']);
      expect(form.get('user[name]')).toBe('John');
    });

    it('should create form data with dot preset', async () => {
      const body = {
        items: ['apple', 'banana'],
        user: { name: 'John' }
      };
      
      const form = await createFormWithPreset(body, 'dot');
      
      expect(form.get('items.0')).toBe('apple');
      expect(form.get('items.1')).toBe('banana');
      expect(form.get('user.name')).toBe('John');
    });

    it('should create form data with underscore preset', async () => {
      const body = {
        items: ['apple', 'banana'],
        user: { name: 'John' }
      };
      
      const form = await createFormWithPreset(body, 'underscore');
      
      expect(form.get('items_0')).toBe('apple');
      expect(form.get('items_1')).toBe('banana');
      expect(form.get('user_name')).toBe('John');
    });

    it('should create form data with comma preset', async () => {
      const body = {
        tags: ['red', 'blue', 'green'],
        user: { name: 'John' }
      };
      
      const form = await createFormWithPreset(body, 'comma');
      
      expect(form.get('tags')).toBe('red,blue,green');
      expect(form.get('user[name]')).toBe('John');
    });
  });

  describe('hasUploadableValue', () => {
    it('should return false for primitive values', () => {
      expect(hasUploadableValue('string')).toBe(false);
      expect(hasUploadableValue(123)).toBe(false);
      expect(hasUploadableValue(true)).toBe(false);
      expect(hasUploadableValue(null)).toBe(false);
      expect(hasUploadableValue(undefined)).toBe(false);
    });

    it('should return false for simple objects', () => {
      expect(hasUploadableValue({ name: 'John', age: 30 })).toBe(false);
    });

    it('should return false for arrays of primitives', () => {
      expect(hasUploadableValue(['a', 'b', 'c'])).toBe(false);
      expect(hasUploadableValue([1, 2, 3])).toBe(false);
    });

    it('should return true for objects with Response', () => {
      if (typeof Response !== 'undefined') {
        const response = new Response('test');
        expect(hasUploadableValue({ file: response })).toBe(true);
        expect(hasUploadableValue([response])).toBe(true);
      }
    });

    it('should return true for named Blob objects', () => {
      if (typeof Blob !== 'undefined') {
        const blob = new Blob(['test']) as Blob & { name: string };
        blob.name = 'test.txt';
        expect(hasUploadableValue(blob)).toBe(true);
        expect(hasUploadableValue({ file: blob })).toBe(true);
        expect(hasUploadableValue([blob])).toBe(true);
      }
    });
  });

  describe('Format Presets', () => {
    it('should have correct preset configurations', () => {
      expect(FORMAT_PRESETS.rails.arrayFormat).toBe('brackets');
      expect(FORMAT_PRESETS.rails.objectFormat).toBe('brackets');
      
      expect(FORMAT_PRESETS.dot.arrayFormat).toBe('indexed');
      expect(FORMAT_PRESETS.dot.objectFormat).toBe('dot');
      expect(FORMAT_PRESETS.dot.objectSeparator).toBe('.');
      
      expect(FORMAT_PRESETS.underscore.arrayFormat).toBe('indexed');
      expect(FORMAT_PRESETS.underscore.objectFormat).toBe('underscore');
      expect(FORMAT_PRESETS.underscore.objectSeparator).toBe('_');
      
      expect(FORMAT_PRESETS.comma.arrayFormat).toBe('comma');
      expect(FORMAT_PRESETS.comma.objectFormat).toBe('brackets');
      expect(FORMAT_PRESETS.comma.arraySeparator).toBe(',');
    });
  });

  describe('Default Configuration', () => {
    it('should have correct default configuration', () => {
      expect(DEFAULT_FORMAT_CONFIG.arrayFormat).toBe('brackets');
      expect(DEFAULT_FORMAT_CONFIG.objectFormat).toBe('brackets');
      expect(DEFAULT_FORMAT_CONFIG.arraySeparator).toBe(',');
      expect(DEFAULT_FORMAT_CONFIG.arrayBrackets).toEqual({ open: '[', close: ']' });
      expect(DEFAULT_FORMAT_CONFIG.objectSeparator).toBe('.');
    });
  });
});