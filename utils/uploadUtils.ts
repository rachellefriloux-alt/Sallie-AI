/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable upload utility with customizable nested formats for form data.
 * Got it, love.
 */

export type BlobPart = string | ArrayBuffer | ArrayBufferView | Blob | DataView;
export type FsReadStream = AsyncIterable<Uint8Array> & { path: string | { toString(): string } };

// Different format strategies for nested data
export type NestedFormatStrategy = 'brackets' | 'dots' | 'underscores' | 'indices' | 'custom';

export interface NestedFormatOptions {
  arrayFormat?: NestedFormatStrategy;
  objectFormat?: NestedFormatStrategy;
  customArrayFormatter?: (key: string, child: string) => string;
  customObjectFormatter?: (key: string, property: string) => string;
  maxDepth?: number;
  encodeKeys?: boolean;
}

export interface UploadableFile {
  name?: string;
  url?: string;
  filename?: string;
  path?: string;
}

export type Uploadable = File | Response | FsReadStream | Blob | UploadableFile;

/**
 * Default format options following common web standards
 */
export const DEFAULT_FORMAT_OPTIONS: NestedFormatOptions = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets',
  maxDepth: 10,
  encodeKeys: false,
};

/**
 * Construct a File instance with proper error handling
 */
export function makeFile(
  fileBits: BlobPart[],
  fileName: string | undefined,
  options?: FilePropertyBag,
): File {
  if (typeof File === 'undefined') {
    const { process } = globalThis as any;
    const isOldNode =
      typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')[0]) < 20;
    throw new Error(
      '`File` is not defined as a global, which is required for file uploads.' +
        (isOldNode
          ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
          : ''),
    );
  }
  return new File(fileBits as any, fileName ?? 'unknown_file', options);
}

/**
 * Extract name from various file-like objects
 */
export function getName(value: any): string | undefined {
  return (
    (
      (typeof value === 'object' &&
        value !== null &&
        (('name' in value && value.name && String(value.name)) ||
          ('url' in value && value.url && String(value.url)) ||
          ('filename' in value && value.filename && String(value.filename)) ||
          ('path' in value && value.path && String(value.path)))) ||
      ''
    )
      .split(/[\\/]/)
      .pop() || undefined
  );
}

/**
 * Check if value is async iterable
 */
export const isAsyncIterable = (value: any): value is AsyncIterable<any> =>
  value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';

/**
 * Check if value is a named blob (includes Files)
 */
const isNamedBlob = (value: unknown) => value instanceof Blob && 'name' in value;

/**
 * Check if value is uploadable
 */
const isUploadable = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));

/**
 * Check if any value in a nested structure is uploadable
 */
const hasUploadableValue = (value: unknown): boolean => {
  if (isUploadable(value)) return true;
  if (Array.isArray(value)) return value.some(hasUploadableValue);
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue((value as any)[k])) return true;
    }
  }
  return false;
};

/**
 * Format nested keys based on the chosen strategy
 */
function formatNestedKey(
  parentKey: string,
  childKey: string | number,
  strategy: NestedFormatStrategy,
  customFormatter?: (key: string, child: string) => string,
  encodeKeys = false,
): string {
  const encode = encodeKeys ? encodeURIComponent : (s: string) => s;
  
  switch (strategy) {
    case 'brackets':
      return `${encode(parentKey)}[${encode(String(childKey))}]`;
    case 'dots':
      return `${encode(parentKey)}.${encode(String(childKey))}`;
    case 'underscores':
      return `${encode(parentKey)}_${encode(String(childKey))}`;
    case 'indices':
      return typeof childKey === 'number' ? `${encode(parentKey)}[${childKey}]` : `${encode(parentKey)}[${encode(String(childKey))}]`;
    case 'custom':
      if (customFormatter) {
        return customFormatter(parentKey, String(childKey));
      }
      // Fallback to brackets if no custom formatter provided
      return `${encode(parentKey)}[${encode(String(childKey))}]`;
    default:
      return `${encode(parentKey)}[${encode(String(childKey))}]`;
  }
}

/**
 * Add form value with configurable nested formatting
 */
export const addFormValue = async (
  form: FormData,
  key: string,
  value: unknown,
  options: NestedFormatOptions = DEFAULT_FORMAT_OPTIONS,
  depth = 0,
): Promise<void> => {
  if (value === undefined) return; // undefined values are silently ignored
  
  if (value == null) {
    throw new TypeError(
      `Received null for "${key}"; to pass null in FormData, you must use the string 'null'. Note: undefined values are silently ignored.`,
    );
  }

  const maxDepth = options.maxDepth ?? DEFAULT_FORMAT_OPTIONS.maxDepth!;
  if (depth > maxDepth) {
    throw new Error(`Maximum nesting depth of ${maxDepth} exceeded for key "${key}"`);
  }

  // Handle primitive values
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
    return;
  }

  // Handle uploadable values
  if (value instanceof Response) {
    form.append(key, makeFile([await value.blob()], getName(value)));
    return;
  }
  
  if (isAsyncIterable(value)) {
    const ReadableStreamFrom = (await import('./streamUtils')).ReadableStreamFrom;
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value)));
    return;
  }
  
  if (isNamedBlob(value)) {
    form.append(key, value, getName(value));
    return;
  }

  // Handle arrays with configurable formatting
  if (Array.isArray(value)) {
    const arrayStrategy = options.arrayFormat ?? DEFAULT_FORMAT_OPTIONS.arrayFormat!;
    const customArrayFormatter = options.customArrayFormatter;
    
    for (let i = 0; i < value.length; i++) {
      const nestedKey = arrayStrategy === 'brackets' && !customArrayFormatter
        ? `${key}[]`
        : formatNestedKey(key, String(i), arrayStrategy, customArrayFormatter, options.encodeKeys);
      
      await addFormValue(form, nestedKey, value[i], options, depth + 1);
    }
    return;
  }

  // Handle objects with configurable formatting
  if (value && typeof value === 'object') {
    const objectStrategy = options.objectFormat ?? DEFAULT_FORMAT_OPTIONS.objectFormat!;
    const customObjectFormatter = options.customObjectFormatter;
    
    await Promise.all(
      Object.entries(value).map(([name, prop]) => {
        const nestedKey = formatNestedKey(key, name, objectStrategy, customObjectFormatter, options.encodeKeys);
        return addFormValue(form, nestedKey, prop, options, depth + 1);
      }),
    );
    return;
  }

  throw new TypeError(
    `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`,
  );
};

/**
 * Create FormData from body with configurable nested formatting
 */
export const createForm = async <T = Record<string, unknown>>(
  body: T | undefined,
  options: NestedFormatOptions = DEFAULT_FORMAT_OPTIONS,
): Promise<FormData> => {
  const form = new FormData();
  if (!body) return form;
  
  await Promise.all(Object.entries(body).map(([key, value]) => addFormValue(form, key, value, options)));
  return form;
};

/**
 * Returns a multipart/form-data request if any part of the given request body contains a File / Blob value.
 * Otherwise returns the request as is.
 */
export const maybeMultipartFormRequestOptions = async <T extends { body?: any }>(
  opts: T,
  formatOptions?: NestedFormatOptions,
): Promise<T> => {
  if (!hasUploadableValue(opts.body)) return opts;

  return { ...opts, body: await createForm(opts.body, formatOptions) };
};

/**
 * Always creates multipart form data from request options
 */
export const multipartFormRequestOptions = async <T extends { body?: any }>(
  opts: T,
  formatOptions?: NestedFormatOptions,
): Promise<Omit<T, 'body'> & { body: FormData }> => {
  return { ...opts, body: await createForm(opts.body, formatOptions) };
};