/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Comprehensive tests for configurable uploads manager with nested formatting.
 * Got it, love.
 */

import { UploadsManager, createUploadsManager, DEFAULT_NESTED_CONFIG } from '../ai/integrations/UploadsManager';

// Mock global File if not available in test environment
if (typeof File === 'undefined') {
  (global as any).File = class MockFile {
    constructor(public fileBits: BlobPart[], public name: string, public options?: FilePropertyBag) {}
  };
}

// Mock FormData for testing
class MockFormData {
  private entries: Array<[string, any]> = [];

  append(key: string, value: any, filename?: string): void {
    this.entries.push([key, value]);
  }

  getEntries(): Array<[string, any]> {
    return [...this.entries];
  }

  has(key: string): boolean {
    return this.entries.some(([k]) => k === key);
  }

  get(key: string): any {
    const entry = this.entries.find(([k]) => k === key);
    return entry ? entry[1] : null;
  }

  getAll(key: string): any[] {
    return this.entries.filter(([k]) => k === key).map(([, v]) => v);
  }
}

// Replace global FormData for testing
(global as any).FormData = MockFormData;

describe('UploadsManager', () => {
  let uploadsManager: UploadsManager;

  beforeEach(() => {
    uploadsManager = new UploadsManager();
  });

  describe('Configuration Management', () => {
    it('should use default configuration initially', () => {
      const config = uploadsManager.getConfig();
      expect(config).toEqual(DEFAULT_NESTED_CONFIG);
    });

    it('should allow configuration updates', () => {
      const newConfig = {
        arrayFormat: 'indexed' as const,
        objectFormat: 'dot' as const,
        maxDepth: 5
      };

      uploadsManager.updateConfig(newConfig);
      const config = uploadsManager.getConfig();

      expect(config.arrayFormat).toBe('indexed');
      expect(config.objectFormat).toBe('dot');
      expect(config.maxDepth).toBe(5);
    });

    it('should merge configurations partially', () => {
      uploadsManager.updateConfig({ arrayFormat: 'indexed' });
      const config = uploadsManager.getConfig();

      expect(config.arrayFormat).toBe('indexed');
      expect(config.objectFormat).toBe(DEFAULT_NESTED_CONFIG.objectFormat);
      expect(config.maxDepth).toBe(DEFAULT_NESTED_CONFIG.maxDepth);
    });
  });

  describe('File Support Validation', () => {
    it('should not throw when File is available', () => {
      expect(() => uploadsManager.checkFileSupport()).not.toThrow();
    });

    it('should create file instances', () => {
      const file = uploadsManager.makeFile(['test content'], 'test.txt');
      expect(file).toBeDefined();
      expect(file.name).toBe('test.txt');
    });
  });

  describe('Filename Extraction', () => {
    it('should extract name from object with name property', () => {
      const obj = { name: 'test.txt' };
      expect(uploadsManager.getName(obj)).toBe('test.txt');
    });

    it('should extract filename from path', () => {
      const obj = { path: '/uploads/documents/test.pdf' };
      expect(uploadsManager.getName(obj)).toBe('test.pdf');
    });

    it('should extract filename from URL', () => {
      const obj = { url: 'https://example.com/files/document.docx' };
      expect(uploadsManager.getName(obj)).toBe('document.docx');
    });

    it('should return undefined for objects without valid name fields', () => {
      const obj = { id: 123, data: 'content' };
      expect(uploadsManager.getName(obj)).toBeUndefined();
    });

    it('should return undefined for non-objects', () => {
      expect(uploadsManager.getName('string')).toBeUndefined();
      expect(uploadsManager.getName(123)).toBeUndefined();
      expect(uploadsManager.getName(null)).toBeUndefined();
    });
  });

  describe('Array Format Configuration', () => {
    it('should format arrays with brackets by default', async () => {
      const body = { items: ['a', 'b', 'c'] };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toEqual([
        ['items[]', 'a'],
        ['items[]', 'b'],
        ['items[]', 'c']
      ]);
    });

    it('should format arrays with indexed format', async () => {
      uploadsManager.updateConfig({ arrayFormat: 'indexed' });
      const body = { items: ['a', 'b', 'c'] };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toEqual([
        ['items[0]', 'a'],
        ['items[1]', 'b'],
        ['items[2]', 'c']
      ]);
    });

    it('should format arrays with comma format', async () => {
      uploadsManager.updateConfig({ arrayFormat: 'comma' });
      const body = { items: ['a', 'b', 'c'] };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toEqual([
        ['items', 'a,b,c']
      ]);
    });

    it('should format arrays with custom format', async () => {
      uploadsManager.updateConfig({ 
        arrayFormat: 'custom',
        arrayCustomFormat: '{key}.{index}'
      });
      const body = { items: ['a', 'b'] };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toEqual([
        ['items.0', 'a'],
        ['items.1', 'b']
      ]);
    });
  });

  describe('Object Format Configuration', () => {
    it('should format objects with brackets by default', async () => {
      const body = { user: { name: 'John', age: 30 } };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toContainEqual(['user[name]', 'John']);
      expect(entries).toContainEqual(['user[age]', '30']);
    });

    it('should format objects with dot notation', async () => {
      uploadsManager.updateConfig({ objectFormat: 'dot' });
      const body = { user: { name: 'John', age: 30 } };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toContainEqual(['user.name', 'John']);
      expect(entries).toContainEqual(['user.age', '30']);
    });

    it('should format objects with custom format', async () => {
      uploadsManager.updateConfig({ 
        objectFormat: 'custom',
        objectCustomFormat: '{key}_{prop}'
      });
      const body = { user: { name: 'John', age: 30 } };
      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toContainEqual(['user_name', 'John']);
      expect(entries).toContainEqual(['user_age', '30']);
    });
  });

  describe('Nested Structures', () => {
    it('should handle nested arrays and objects', async () => {
      uploadsManager.updateConfig({ 
        arrayFormat: 'indexed',
        objectFormat: 'dot'
      });

      const body = {
        users: [
          { name: 'John', tags: ['admin', 'user'] },
          { name: 'Jane', tags: ['user'] }
        ]
      };

      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toContainEqual(['users[0].name', 'John']);
      expect(entries).toContainEqual(['users[0].tags[0]', 'admin']);
      expect(entries).toContainEqual(['users[0].tags[1]', 'user']);
      expect(entries).toContainEqual(['users[1].name', 'Jane']);
      expect(entries).toContainEqual(['users[1].tags[0]', 'user']);
    });

    it('should enforce maximum depth limits', async () => {
      uploadsManager.updateConfig({ maxDepth: 2 });

      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              level4: 'too deep'
            }
          }
        }
      };

      await expect(uploadsManager.createForm(deeplyNested))
        .rejects
        .toThrow('Maximum nesting depth (2) exceeded');
    });
  });

  describe('Data Type Handling', () => {
    it('should handle primitive types', async () => {
      const body = {
        string: 'text',
        number: 42,
        boolean: true
      };

      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toContainEqual(['string', 'text']);
      expect(entries).toContainEqual(['number', '42']);
      expect(entries).toContainEqual(['boolean', 'true']);
    });

    it('should reject null values with helpful message', async () => {
      const body = { nullValue: null };

      await expect(uploadsManager.createForm(body))
        .rejects
        .toThrow('Received null for "nullValue"; to pass null in FormData, you must use the string \'null\'');
    });

    it('should skip undefined values', async () => {
      const body = { 
        defined: 'value',
        undefined: undefined
      };

      const form = await uploadsManager.createForm(body) as any;
      const entries = form.getEntries();

      expect(entries).toHaveLength(1);
      expect(entries).toContainEqual(['defined', 'value']);
    });

    it('should reject invalid types', async () => {
      const body = { symbol: Symbol('test') };

      await expect(uploadsManager.createForm(body))
        .rejects
        .toThrow('Invalid value given to form');
    });
  });

  describe('Utility Functions', () => {
    it('should detect async iterables', () => {
      const asyncIterable = {
        async* [Symbol.asyncIterator]() {
          yield 'data';
        }
      };

      expect(uploadsManager.isAsyncIterable(asyncIterable)).toBe(true);
      expect(uploadsManager.isAsyncIterable({})).toBe(false);
      expect(uploadsManager.isAsyncIterable(null)).toBe(false);
    });
  });

  describe('Factory Functions', () => {
    it('should create manager with custom config', () => {
      const manager = createUploadsManager({
        arrayFormat: 'indexed',
        maxDepth: 5
      });

      const config = manager.getConfig();
      expect(config.arrayFormat).toBe('indexed');
      expect(config.maxDepth).toBe(5);
      expect(config.objectFormat).toBe(DEFAULT_NESTED_CONFIG.objectFormat);
    });
  });

  describe('Request Options Processing', () => {
    it('should return original options when no uploadable content', async () => {
      const opts = { 
        body: { text: 'simple string', number: 42 },
        headers: { 'Content-Type': 'application/json' }
      };

      const result = await uploadsManager.maybeMultipartFormRequestOptions(opts);
      expect(result).toBe(opts);
    });

    it('should create FormData when uploadable content detected', async () => {
      const mockFile = new (global as any).File(['content'], 'test.txt');
      const opts = { 
        body: { file: mockFile, text: 'description' }
      };

      const result = await uploadsManager.maybeMultipartFormRequestOptions(opts);
      expect(result.body).toBeInstanceOf(MockFormData);
      expect(result.body).not.toBe(opts.body);
    });
  });
});