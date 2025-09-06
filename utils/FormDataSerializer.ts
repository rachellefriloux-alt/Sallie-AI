/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable FormData serialization with nested format support.
 * Got it, love.
 */

export type NestedFormat = 'bracket' | 'dot' | 'rails' | 'comma';

export interface SerializationOptions {
  nestedFormat: NestedFormat;
  arrayFormat: 'indices' | 'brackets' | 'repeat' | 'comma';
  allowDots: boolean;
  encodeDotInKeys: boolean;
  skipNulls: boolean;
  strictNullHandling: boolean;
  encodeValuesOnly: boolean;
  addQueryPrefix: boolean;
  delimiter: string;
  charset: 'utf-8' | 'iso-8859-1';
}

export const DEFAULT_OPTIONS: SerializationOptions = {
  nestedFormat: 'bracket',
  arrayFormat: 'indices',
  allowDots: false,
  encodeDotInKeys: false,
  skipNulls: false,
  strictNullHandling: false,
  encodeValuesOnly: false,
  addQueryPrefix: false,
  delimiter: '&',
  charset: 'utf-8',
};

/**
 * Enhanced FormData serializer with configurable nested formats
 * Replaces hardcoded bracket notation with configurable strategies
 */
export class FormDataSerializer {
  private options: SerializationOptions;

  constructor(options: Partial<SerializationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Creates a FormData object from a given object with configurable nested formatting
   */
  async createForm<T = Record<string, unknown>>(
    body: T | undefined
  ): Promise<FormData> {
    const form = new FormData();
    
    if (!body) return form;

    await Promise.all(
      Object.entries(body || {}).map(([key, value]) => 
        this.addFormValue(form, key, value)
      )
    );
    
    return form;
  }

  /**
   * Adds a value to FormData with configurable nested formatting
   */
  private async addFormValue(
    form: FormData, 
    key: string, 
    value: unknown
  ): Promise<void> {
    if (value === undefined && this.options.skipNulls) return;
    
    if (value === null) {
      if (this.options.strictNullHandling) {
        throw new TypeError(
          `Received null for "${key}"; to pass null in FormData, you must use the string 'null'. Note: undefined values are silently ignored.`
        );
      }
      form.append(key, 'null');
      return;
    }

    // Handle primitive values
    if (this.isPrimitive(value)) {
      form.append(key, String(value));
      return;
    }

    // Handle File/Blob objects
    if (this.isUploadable(value)) {
      await this.handleUploadable(form, key, value);
      return;
    }

    // Handle arrays with configurable format
    if (Array.isArray(value)) {
      await this.handleArray(form, key, value);
      return;
    }

    // Handle nested objects with configurable format
    if (this.isObject(value)) {
      await this.handleNestedObject(form, key, value);
      return;
    }

    // Better error handling for invalid types
    try {
      throw new TypeError(
        `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${typeof value} instead`
      );
    } catch (error) {
      if (error instanceof TypeError) {
        throw error;
      }
      // Handle cases where toString() might fail (like Symbol)
      throw new TypeError(
        `Invalid value given to form, received an unsupported value type`
      );
    }
  }

  /**
   * Handles array serialization based on arrayFormat option
   */
  private async handleArray(form: FormData, key: string, array: unknown[]): Promise<void> {
    switch (this.options.arrayFormat) {
      case 'indices':
        for (let i = 0; i < array.length; i++) {
          await this.addFormValue(form, `${key}[${i}]`, array[i]);
        }
        break;
      
      case 'brackets':
        for (const entry of array) {
          await this.addFormValue(form, `${key}[]`, entry);
        }
        break;
      
      case 'repeat':
        for (const entry of array) {
          await this.addFormValue(form, key, entry);
        }
        break;
      
      case 'comma':
        if (array.every(item => this.isPrimitive(item))) {
          form.append(key, array.map(String).join(','));
        } else {
          // Fallback to brackets for complex objects
          for (const entry of array) {
            await this.addFormValue(form, `${key}[]`, entry);
          }
        }
        break;
    }
  }

  /**
   * Handles nested object serialization based on nestedFormat option
   */
  private async handleNestedObject(form: FormData, key: string, obj: Record<string, unknown>): Promise<void> {
    for (const [nestedKey, nestedValue] of Object.entries(obj)) {
      const formattedKey = this.formatNestedKey(key, nestedKey);
      await this.addFormValue(form, formattedKey, nestedValue);
    }
  }

  /**
   * Formats nested object keys based on the configured nested format
   */
  private formatNestedKey(parentKey: string, childKey: string): string {
    switch (this.options.nestedFormat) {
      case 'bracket':
      case 'rails':
        return `${parentKey}[${childKey}]`;
      
      case 'dot':
        if (this.options.encodeDotInKeys) {
          // Encode dots in the child key only
          const encodedChildKey = childKey.replace(/\./g, '%2E');
          return `${parentKey}.${encodedChildKey}`;
        }
        return `${parentKey}.${childKey}`;
      
      case 'comma':
        return `${parentKey},${childKey}`;
      
      default:
        return `${parentKey}[${childKey}]`;
    }
  }

  /**
   * Handles uploadable content (File, Blob, Response, etc.)
   */
  private async handleUploadable(form: FormData, key: string, value: any): Promise<void> {
    if (value instanceof Response) {
      form.append(key, this.makeFile([await value.blob()], this.getName(value)));
    } else if (this.isAsyncIterable(value)) {
      // Handle streams - simplified for this implementation
      form.append(key, this.makeFile([await this.streamToBlob(value)], this.getName(value)));
    } else if (this.isNamedBlob(value)) {
      form.append(key, value, this.getName(value));
    } else {
      form.append(key, value);
    }
  }

  /**
   * Creates a File instance with proper error handling
   */
  private makeFile(fileBits: BlobPart[], fileName: string | undefined): File {
    if (typeof File === 'undefined') {
      throw new Error('File is not supported in this environment');
    }
    return new File(fileBits, fileName ?? 'unknown_file');
  }

  /**
   * Extracts a name from various object types
   */
  private getName(value: any): string | undefined {
    if (typeof value === 'object' && value !== null) {
      if ('name' in value && value.name && String(value.name)) {
        return String(value.name).split(/[\\/]/).pop();
      }
      if ('url' in value && value.url && String(value.url)) {
        return String(value.url).split(/[\\/]/).pop();
      }
      if ('filename' in value && value.filename && String(value.filename)) {
        return String(value.filename).split(/[\\/]/).pop();
      }
      if ('path' in value && value.path && String(value.path)) {
        return String(value.path).split(/[\\/]/).pop();
      }
    }
    return undefined;
  }

  /**
   * Type guards and utility methods
   */
  private isPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !this.isUploadable(value);
  }

  private isUploadable(value: unknown): boolean {
    return (
      value instanceof Response ||
      this.isAsyncIterable(value) ||
      this.isNamedBlob(value) ||
      value instanceof File ||
      value instanceof Blob
    );
  }

  private isNamedBlob(value: unknown): value is Blob & { name?: string } {
    return value instanceof Blob && 'name' in value;
  }

  private isAsyncIterable(value: any): value is AsyncIterable<any> {
    return value != null && 
           typeof value === 'object' && 
           typeof value[Symbol.asyncIterator] === 'function';
  }

  private async streamToBlob(stream: AsyncIterable<any>): Promise<Blob> {
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return new Blob(chunks);
  }

  /**
   * Updates serialization options
   */
  updateOptions(newOptions: Partial<SerializationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Gets current serialization options
   */
  getOptions(): SerializationOptions {
    return { ...this.options };
  }
}

/**
 * Convenience function for quick FormData creation with default options
 */
export async function createFormData<T = Record<string, unknown>>(
  body: T | undefined,
  options?: Partial<SerializationOptions>
): Promise<FormData> {
  const serializer = new FormDataSerializer(options);
  return serializer.createForm(body);
}

/**
 * Convenience function that mimics the original addFormValue with configurable formats
 */
export async function addFormValue(
  form: FormData,
  key: string,
  value: unknown,
  options?: Partial<SerializationOptions>
): Promise<void> {
  const serializer = new FormDataSerializer(options);
  // Access private method through a temporary instance
  await (serializer as any).addFormValue(form, key, value);
}