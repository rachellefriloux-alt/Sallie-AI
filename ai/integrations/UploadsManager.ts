/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable uploads manager for OpenAI file operations with flexible nested formatting.
 * Got it, love.
 */

/**
 * Configuration interface for nested format options in form data
 */
export interface NestedFormatConfig {
  /** Format for arrays - can use placeholders: {key} for field name, {index} for array index */
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'custom';
  /** Custom format string for arrays when arrayFormat is 'custom' */
  arrayCustomFormat?: string;
  /** Format for objects - can use placeholders: {key} for field name, {prop} for property name */
  objectFormat: 'brackets' | 'dot' | 'custom';
  /** Custom format string for objects when objectFormat is 'custom' */
  objectCustomFormat?: string;
  /** Maximum nesting depth to prevent infinite recursion */
  maxDepth: number;
}

/**
 * Default configuration for nested formats
 */
export const DEFAULT_NESTED_CONFIG: NestedFormatConfig = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets',
  maxDepth: 10
};

/**
 * File-like interface for uploads
 */
export interface UploadableFile {
  name?: string;
  url?: string;
  filename?: string;
  path?: string;
}

/**
 * Enhanced uploads manager with configurable nested formats
 */
export class UploadsManager {
  private config: NestedFormatConfig;

  constructor(config: Partial<NestedFormatConfig> = {}) {
    this.config = { ...DEFAULT_NESTED_CONFIG, ...config };
  }

  /**
   * Update configuration for nested formats
   */
  updateConfig(newConfig: Partial<NestedFormatConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): NestedFormatConfig {
    return { ...this.config };
  }

  /**
   * Check if File support is available
   */
  checkFileSupport(): void {
    if (typeof File === 'undefined') {
      const { process } = globalThis;
      const isOldNode = typeof process?.versions?.node === 'string' && 
        parseInt(process.versions.node.split('.')[0]) < 20;
      
      throw new Error(
        '`File` is not defined as a global, which is required for file uploads.' +
        (isOldNode 
          ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
          : '')
      );
    }
  }

  /**
   * Construct a File instance with helpful error handling
   */
  makeFile(fileBits: BlobPart[], fileName?: string, options?: FilePropertyBag): File {
    this.checkFileSupport();
    return new File(fileBits, fileName ?? 'unknown_file', options);
  }

  /**
   * Extract filename from various file-like objects
   */
  getName(value: any): string | undefined {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }

    const nameFields = ['name', 'url', 'filename', 'path'];
    for (const field of nameFields) {
      if (field in value && value[field] && typeof value[field] === 'string') {
        return String(value[field]).split(/[\\/]/).pop() || undefined;
      }
    }

    return undefined;
  }

  /**
   * Check if value is async iterable
   */
  isAsyncIterable(value: any): value is AsyncIterable<any> {
    return value != null && 
      typeof value === 'object' && 
      typeof value[Symbol.asyncIterator] === 'function';
  }

  /**
   * Check if value is a named blob (File or similar)
   */
  private isNamedBlob(value: any): value is Blob & { name: string } {
    return value instanceof Blob && 'name' in value;
  }

  /**
   * Check if value is uploadable
   */
  private isUploadable(value: any): boolean {
    return typeof value === 'object' &&
      value !== null &&
      (value instanceof Response || this.isAsyncIterable(value) || this.isNamedBlob(value));
  }

  /**
   * Check if object contains any uploadable values
   */
  private hasUploadableValue(value: any): boolean {
    if (this.isUploadable(value)) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.some(item => this.hasUploadableValue(item));
    }

    if (value && typeof value === 'object') {
      for (const k in value) {
        if (this.hasUploadableValue(value[k])) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Generate form field name for arrays based on configuration
   */
  private formatArrayKey(key: string, index: number): string {
    switch (this.config.arrayFormat) {
      case 'brackets':
        return `${key}[]`;
      case 'indexed':
        return `${key}[${index}]`;
      case 'comma':
        return key; // Will be handled differently in form creation
      case 'custom':
        return this.config.arrayCustomFormat
          ?.replace('{key}', key)
          ?.replace('{index}', index.toString()) || `${key}[]`;
      default:
        return `${key}[]`;
    }
  }

  /**
   * Generate form field name for objects based on configuration
   */
  private formatObjectKey(key: string, propName: string): string {
    switch (this.config.objectFormat) {
      case 'brackets':
        return `${key}[${propName}]`;
      case 'dot':
        return `${key}.${propName}`;
      case 'custom':
        return this.config.objectCustomFormat
          ?.replace('{key}', key)
          ?.replace('{prop}', propName) || `${key}[${propName}]`;
      default:
        return `${key}[${propName}]`;
    }
  }

  /**
   * Add form value with configurable nested formatting
   */
  private async addFormValue(
    form: FormData, 
    key: string, 
    value: any, 
    depth: number = 0
  ): Promise<void> {
    if (value === undefined) {
      return;
    }

    if (value == null) {
      throw new TypeError(
        `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`
      );
    }

    if (depth > this.config.maxDepth) {
      throw new Error(
        `Maximum nesting depth (${this.config.maxDepth}) exceeded for key "${key}"`
      );
    }

    // Handle primitive types
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      form.append(key, String(value));
      return;
    }

    // Handle Response objects
    if (value instanceof Response) {
      form.append(key, this.makeFile([await value.blob()], this.getName(value)));
      return;
    }

    // Handle async iterables
    if (this.isAsyncIterable(value)) {
      const blob = await new Response(this.streamFromAsyncIterable(value)).blob();
      form.append(key, this.makeFile([blob], this.getName(value)));
      return;
    }

    // Handle named blobs (Files)
    if (this.isNamedBlob(value)) {
      form.append(key, value, this.getName(value));
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (this.config.arrayFormat === 'comma') {
        // Special handling for comma format - join values
        const stringValues = value.map(item => 
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        );
        form.append(key, stringValues.join(','));
        return;
      }

      // Regular array handling with configurable formatting
      await Promise.all(
        value.map((entry, index) => 
          this.addFormValue(form, this.formatArrayKey(key, index), entry, depth + 1)
        )
      );
      return;
    }

    // Handle objects
    if (typeof value === 'object') {
      await Promise.all(
        Object.entries(value).map(([name, prop]) =>
          this.addFormValue(form, this.formatObjectKey(key, name), prop, depth + 1)
        )
      );
      return;
    }

    throw new TypeError(
      `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${typeof value} instead`
    );
  }

  /**
   * Create ReadableStream from async iterable
   */
  private streamFromAsyncIterable(iterable: AsyncIterable<any>): ReadableStream {
    const iterator = iterable[Symbol.asyncIterator]();
    
    return new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await iterator.next();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      },

      async cancel() {
        if (typeof iterator.return === 'function') {
          await iterator.return();
        }
      }
    });
  }

  /**
   * Create FormData from object with configurable nested formatting
   */
  async createForm(body: Record<string, any>): Promise<FormData> {
    const form = new FormData();
    await Promise.all(
      Object.entries(body || {}).map(([key, value]) => 
        this.addFormValue(form, key, value)
      )
    );
    return form;
  }

  /**
   * Create multipart form request options if needed
   */
  async maybeMultipartFormRequestOptions(
    opts: { body?: any; [key: string]: any }
  ): Promise<{ body?: FormData; [key: string]: any }> {
    if (!this.hasUploadableValue(opts.body)) {
      return opts;
    }
    return { ...opts, body: await this.createForm(opts.body) };
  }

  /**
   * Force multipart form request options
   */
  async multipartFormRequestOptions(
    opts: { body?: any; [key: string]: any }
  ): Promise<{ body?: FormData; [key: string]: any }> {
    return { ...opts, body: await this.createForm(opts.body) };
  }
}

/**
 * Create a singleton instance with default configuration
 */
export const defaultUploadsManager = new UploadsManager();

/**
 * Factory function to create UploadsManager with custom configuration
 */
export function createUploadsManager(config?: Partial<NestedFormatConfig>): UploadsManager {
  return new UploadsManager(config);
}