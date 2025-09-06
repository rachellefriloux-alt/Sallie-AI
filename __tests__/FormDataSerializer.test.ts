/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for configurable FormData serialization utility.
 * Got it, love.
 */

import { FormDataSerializer, createFormData, NestedFormat, SerializationOptions } from '../utils/FormDataSerializer';

// Mock FormData for Node.js environment
(global as any).FormData = class MockFormData {
  private entries: Array<[string, any]> = [];

  append(name: string, value: any, filename?: string): void {
    this.entries.push([name, value]);
  }

  getEntries(): Array<[string, any]> {
    return [...this.entries];
  }

  has(name: string): boolean {
    return this.entries.some(([key]) => key === name);
  }

  get(name: string): any {
    const entry = this.entries.find(([key]) => key === name);
    return entry ? entry[1] : null;
  }

  getAll(name: string): any[] {
    return this.entries.filter(([key]) => key === name).map(([, value]) => value);
  }
};

// Mock File for Node.js environment
(global as any).File = class MockFile {
  constructor(public bits: any[], public name: string, public options?: any) {}
};

describe('FormDataSerializer', () => {
  let serializer: FormDataSerializer;

  beforeEach(() => {
    serializer = new FormDataSerializer();
  });

  describe('Basic functionality', () => {
    it('should create empty FormData for undefined input', async () => {
      const form = await serializer.createForm(undefined);
      expect(form).toBeInstanceOf(FormData);
      expect((form as any).getEntries()).toHaveLength(0);
    });

    it('should handle primitive values', async () => {
      const data = {
        string: 'hello',
        number: 42,
        boolean: true,
      };

      const form = await serializer.createForm(data);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['string', 'hello']);
      expect(entries).toContainEqual(['number', '42']);
      expect(entries).toContainEqual(['boolean', 'true']);
    });

    it('should handle null values based on strictNullHandling', async () => {
      const data = { nullValue: null };

      // Default behavior - convert null to 'null'
      const form1 = await serializer.createForm(data);
      expect((form1 as any).getEntries()).toContainEqual(['nullValue', 'null']);

      // Strict null handling - should throw
      const strictSerializer = new FormDataSerializer({ strictNullHandling: true });
      await expect(strictSerializer.createForm(data)).rejects.toThrow(
        'Received null for "nullValue"'
      );
    });

    it('should skip undefined values when skipNulls is true', async () => {
      const data = { defined: 'value', undefined: undefined };
      
      const skipSerializer = new FormDataSerializer({ skipNulls: true });
      const form = await skipSerializer.createForm(data);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['defined', 'value']);
      expect(entries.find(([key]: [string, any]) => key === 'undefined')).toBeUndefined();
    });
  });

  describe('Nested object formatting', () => {
    const nestedData = {
      user: {
        name: 'John',
        details: {
          age: 30,
          city: 'NYC'
        }
      }
    };

    it('should use bracket notation by default', async () => {
      const form = await serializer.createForm(nestedData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[details][age]', '30']);
      expect(entries).toContainEqual(['user[details][city]', 'NYC']);
    });

    it('should use dot notation when configured', async () => {
      const dotSerializer = new FormDataSerializer({ nestedFormat: 'dot' });
      const form = await dotSerializer.createForm(nestedData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['user.name', 'John']);
      expect(entries).toContainEqual(['user.details.age', '30']);
      expect(entries).toContainEqual(['user.details.city', 'NYC']);
    });

    it('should use comma notation when configured', async () => {
      const commaSerializer = new FormDataSerializer({ nestedFormat: 'comma' });
      const form = await commaSerializer.createForm(nestedData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['user,name', 'John']);
      expect(entries).toContainEqual(['user,details,age', '30']);
      expect(entries).toContainEqual(['user,details,city', 'NYC']);
    });

    it('should use rails format (same as bracket)', async () => {
      const railsSerializer = new FormDataSerializer({ nestedFormat: 'rails' });
      const form = await railsSerializer.createForm(nestedData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[details][age]', '30']);
      expect(entries).toContainEqual(['user[details][city]', 'NYC']);
    });

    it('should encode dots in keys when configured', async () => {
      const data = { 'user.name': { 'sub.key': 'value' } };
      const encodingSerializer = new FormDataSerializer({ 
        nestedFormat: 'dot',
        encodeDotInKeys: true 
      });
      
      const form = await encodingSerializer.createForm(data);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['user.name.sub%2Ekey', 'value']);
    });
  });

  describe('Array formatting', () => {
    const arrayData = {
      tags: ['red', 'blue', 'green'],
      numbers: [1, 2, 3],
      mixed: ['string', 42, true]
    };

    it('should use indices format by default', async () => {
      const form = await serializer.createForm(arrayData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['tags[0]', 'red']);
      expect(entries).toContainEqual(['tags[1]', 'blue']);
      expect(entries).toContainEqual(['tags[2]', 'green']);
      expect(entries).toContainEqual(['numbers[0]', '1']);
      expect(entries).toContainEqual(['numbers[1]', '2']);
      expect(entries).toContainEqual(['numbers[2]', '3']);
    });

    it('should use brackets format when configured', async () => {
      const bracketSerializer = new FormDataSerializer({ arrayFormat: 'brackets' });
      const form = await bracketSerializer.createForm(arrayData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['tags[]', 'red']);
      expect(entries).toContainEqual(['tags[]', 'blue']);
      expect(entries).toContainEqual(['tags[]', 'green']);
    });

    it('should use repeat format when configured', async () => {
      const repeatSerializer = new FormDataSerializer({ arrayFormat: 'repeat' });
      const form = await repeatSerializer.createForm(arrayData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['tags', 'red']);
      expect(entries).toContainEqual(['tags', 'blue']);
      expect(entries).toContainEqual(['tags', 'green']);
    });

    it('should use comma format for primitive arrays', async () => {
      const commaSerializer = new FormDataSerializer({ arrayFormat: 'comma' });
      const form = await commaSerializer.createForm(arrayData);
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['tags', 'red,blue,green']);
      expect(entries).toContainEqual(['numbers', '1,2,3']);
      expect(entries).toContainEqual(['mixed', 'string,42,true']);
    });

    it('should fallback to brackets for complex objects in comma format', async () => {
      const complexArrayData = {
        objects: [{ name: 'John' }, { name: 'Jane' }]
      };

      const commaSerializer = new FormDataSerializer({ arrayFormat: 'comma' });
      const form = await commaSerializer.createForm(complexArrayData);
      const entries = (form as any).getEntries();

      // Should fallback to brackets format for complex objects
      expect(entries).toContainEqual(['objects[][name]', 'John']);
      expect(entries).toContainEqual(['objects[][name]', 'Jane']);
    });
  });

  describe('Combined nested and array formatting', () => {
    it('should handle nested arrays with different formats', async () => {
      const complexData = {
        users: [
          { name: 'John', tags: ['admin', 'user'] },
          { name: 'Jane', tags: ['user'] }
        ]
      };

      // Test bracket nested + indices array
      const bracketIndicesSerializer = new FormDataSerializer({
        nestedFormat: 'bracket',
        arrayFormat: 'indices'
      });
      
      const form1 = await bracketIndicesSerializer.createForm(complexData);
      const entries1 = (form1 as any).getEntries();

      expect(entries1).toContainEqual(['users[0][name]', 'John']);
      expect(entries1).toContainEqual(['users[0][tags][0]', 'admin']);
      expect(entries1).toContainEqual(['users[0][tags][1]', 'user']);
      expect(entries1).toContainEqual(['users[1][name]', 'Jane']);
      expect(entries1).toContainEqual(['users[1][tags][0]', 'user']);

      // Test dot nested + indices array (corrected test expectation)
      const dotIndicesSerializer = new FormDataSerializer({
        nestedFormat: 'dot',
        arrayFormat: 'indices'
      });
      
      const form2 = await dotIndicesSerializer.createForm(complexData);
      const entries2 = (form2 as any).getEntries();

      expect(entries2).toContainEqual(['users[0].name', 'John']);
      expect(entries2).toContainEqual(['users[0].tags[0]', 'admin']);
      expect(entries2).toContainEqual(['users[0].tags[1]', 'user']);
    });
  });

  describe('File and Blob handling', () => {
    it('should handle File objects', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const data = { upload: file };

      const form = await serializer.createForm(data);
      const entries = (form as any).getEntries();

      expect(entries).toHaveLength(1);
      expect(entries[0][0]).toBe('upload');
      expect(entries[0][1]).toBe(file);
    });

    it('should handle Blob objects with names', async () => {
      const blob = new Blob(['content'], { type: 'text/plain' });
      (blob as any).name = 'test.txt';
      const data = { upload: blob };

      const form = await serializer.createForm(data);
      const entries = (form as any).getEntries();

      expect(entries).toHaveLength(1);
      expect(entries[0][0]).toBe('upload');
      expect(entries[0][1]).toBe(blob);
    });
  });

  describe('Error handling', () => {
    it('should throw for invalid value types', async () => {
      const data = { invalid: Symbol('test') };

      await expect(serializer.createForm(data)).rejects.toThrow(
        'Invalid value given to form'
      );
    });
  });

  describe('Configuration management', () => {
    it('should update options', () => {
      const initialOptions = serializer.getOptions();
      expect(initialOptions.nestedFormat).toBe('bracket');

      serializer.updateOptions({ nestedFormat: 'dot' });
      const updatedOptions = serializer.getOptions();
      expect(updatedOptions.nestedFormat).toBe('dot');
    });

    it('should maintain immutable options', () => {
      const options = serializer.getOptions();
      options.nestedFormat = 'dot'; // This shouldn't affect the serializer

      const actualOptions = serializer.getOptions();
      expect(actualOptions.nestedFormat).toBe('bracket');
    });
  });

  describe('Convenience functions', () => {
    it('should create FormData with createFormData function', async () => {
      const data = { key: 'value', nested: { prop: 'val' } };
      
      const form = await createFormData(data, { nestedFormat: 'dot' });
      const entries = (form as any).getEntries();

      expect(entries).toContainEqual(['key', 'value']);
      expect(entries).toContainEqual(['nested.prop', 'val']);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle complex API payload', async () => {
      const apiPayload = {
        user: {
          id: 123,
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          },
          tags: ['premium', 'beta'],
          metadata: {
            lastLogin: '2023-01-01',
            devices: ['mobile', 'desktop']
          }
        },
        files: [] // Empty array
      };

      const form = await serializer.createForm(apiPayload);
      const entries = (form as any).getEntries();

      // Check nested object structure
      expect(entries).toContainEqual(['user[id]', '123']);
      expect(entries).toContainEqual(['user[profile][name]', 'John Doe']);
      expect(entries).toContainEqual(['user[profile][email]', 'john@example.com']);
      expect(entries).toContainEqual(['user[profile][preferences][theme]', 'dark']);
      expect(entries).toContainEqual(['user[profile][preferences][notifications]', 'true']);
      
      // Check arrays
      expect(entries).toContainEqual(['user[tags][0]', 'premium']);
      expect(entries).toContainEqual(['user[tags][1]', 'beta']);
      expect(entries).toContainEqual(['user[metadata][devices][0]', 'mobile']);
      expect(entries).toContainEqual(['user[metadata][devices][1]', 'desktop']);

      // Empty arrays should not add entries by default
      expect(entries.find(([key]: [string, any]) => key.startsWith('files'))).toBeUndefined();
    });

    it('should handle different format combinations for API compatibility', async () => {
      const data = {
        search: {
          filters: {
            category: ['tech', 'science'],
            price: { min: 10, max: 100 }
          }
        }
      };

      // PHP-style (Rails/bracket notation)
      const phpForm = await createFormData(data, { 
        nestedFormat: 'rails',
        arrayFormat: 'brackets'
      });
      const phpEntries = (phpForm as any).getEntries();
      
      expect(phpEntries).toContainEqual(['search[filters][category][]', 'tech']);
      expect(phpEntries).toContainEqual(['search[filters][category][]', 'science']);
      expect(phpEntries).toContainEqual(['search[filters][price][min]', '10']);

      // JavaScript-style (dot notation)
      const jsForm = await createFormData(data, {
        nestedFormat: 'dot',
        arrayFormat: 'comma'
      });
      const jsEntries = (jsForm as any).getEntries();
      
      expect(jsEntries).toContainEqual(['search.filters.category', 'tech,science']);
      expect(jsEntries).toContainEqual(['search.filters.price.min', '10']);
    });
  });
});