/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable form data utility for handling nested objects and arrays in multipart forms.
 * Got it, love.
 */

/**
 * Configuration options for nested form data formatting
 */
export interface FormDataFormatConfig {
  /** Format style for arrays and objects */
  style: 'php' | 'rails' | 'dot' | 'custom';
  /** Custom array formatter (only used when style = 'custom') */
  arrayFormatter?: (key: string, index: number) => string;
  /** Custom object formatter (only used when style = 'custom') */
  objectFormatter?: (key: string, property: string) => string;
  /** Maximum depth for nested objects (default: 10) */
  maxDepth?: number;
  /** Whether to include empty arrays (default: false) */
  includeEmptyArrays?: boolean;
}

/**
 * Default configuration using PHP-style formatting (backward compatible)
 */
export const DEFAULT_CONFIG: FormDataFormatConfig = {
  style: 'php',
  maxDepth: 10,
  includeEmptyArrays: false,
};

/**
 * Predefined format configurations
 */
export const FORMAT_PRESETS = {
  /** PHP-style: key[], key[property] */
  php: { style: 'php' as const },
  /** Rails-style: key[0], key[1], key[property] */
  rails: { style: 'rails' as const },
  /** Dot notation: key.0, key.1, key.property */
  dot: { style: 'dot' as const },
} as const;

/**
 * Error thrown when maximum nesting depth is exceeded
 */
export class MaxDepthExceededError extends Error {
  constructor(depth: number) {
    super(`Maximum nesting depth of ${depth} exceeded`);
    this.name = 'MaxDepthExceededError';
  }
}

/**
 * Generate a formatted key for nested values based on configuration
 */
function formatNestedKey(
  baseKey: string,
  childKey: string | number,
  isArray: boolean,
  config: FormDataFormatConfig
): string {
  const { style, arrayFormatter, objectFormatter } = config;

  switch (style) {
    case 'php':
      return isArray ? `${baseKey}[]` : `${baseKey}[${childKey}]`;
    
    case 'rails':
      return `${baseKey}[${childKey}]`;
    
    case 'dot':
      return `${baseKey}.${childKey}`;
    
    case 'custom':
      if (isArray && arrayFormatter) {
        return arrayFormatter(baseKey, childKey as number);
      }
      if (!isArray && objectFormatter) {
        return objectFormatter(baseKey, String(childKey));
      }
      throw new Error('Custom formatters must be provided when using custom style');
    
    default:
      throw new Error(`Unknown format style: ${style}`);
  }
}

/**
 * Check if a value is uploadable (File, Blob, Response, or AsyncIterable)
 */
function isUploadable(value: any): boolean {
  return value != null && 
    typeof value === 'object' && 
    (value instanceof File || 
     value instanceof Blob || 
     value instanceof Response ||
     (typeof value[Symbol.asyncIterator] === 'function'));
}

/**
 * Check if a value contains any uploadable content
 */
function hasUploadableValue(value: any): boolean {
  if (isUploadable(value)) return true;
  
  if (Array.isArray(value)) {
    return value.some(hasUploadableValue);
  }
  
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue(value[k])) return true;
    }
  }
  
  return false;
}

/**
 * Add a value to form data with configurable nested formatting
 */
async function addFormValue(
  form: FormData,
  key: string,
  value: any,
  config: FormDataFormatConfig,
  depth = 0
): Promise<void> {
  // Check depth limit
  if (depth > (config.maxDepth || 10)) {
    throw new MaxDepthExceededError(config.maxDepth || 10);
  }

  if (value === undefined) return;

  if (value === null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }

  // Handle primitive types
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
    return;
  }

  // Handle uploadable types (File, Blob, Response)
  if (value instanceof File || value instanceof Blob) {
    form.append(key, value);
    return;
  }

  if (value instanceof Response) {
    form.append(key, await value.blob());
    return;
  }

  // Handle async iterables (streams)
  if (value && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function') {
    // Convert async iterable to blob
    const chunks: Uint8Array[] = [];
    for await (const chunk of value) {
      chunks.push(chunk);
    }
    const blob = new Blob(chunks);
    form.append(key, blob);
    return;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0 && !config.includeEmptyArrays) {
      return;
    }

    await Promise.all(
      value.map((entry, index) => {
        const nestedKey = formatNestedKey(key, index, true, config);
        return addFormValue(form, nestedKey, entry, config, depth + 1);
      })
    );
    return;
  }

  // Handle objects
  if (typeof value === 'object') {
    await Promise.all(
      Object.entries(value).map(([property, propertyValue]) => {
        const nestedKey = formatNestedKey(key, property, false, config);
        return addFormValue(form, nestedKey, propertyValue, config, depth + 1);
      })
    );
    return;
  }

  throw new TypeError(
    `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${typeof value} instead`
  );
}

/**
 * Create FormData from an object with configurable nested formatting
 */
export async function createConfigurableForm(
  body: Record<string, any>,
  config: FormDataFormatConfig = DEFAULT_CONFIG
): Promise<FormData> {
  const form = new FormData();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  await Promise.all(
    Object.entries(body || {}).map(([key, value]) =>
      addFormValue(form, key, value, mergedConfig)
    )
  );

  return form;
}

/**
 * Check if a request body requires multipart form data
 */
export function requiresMultipartForm(body: any): boolean {
  return hasUploadableValue(body);
}

/**
 * Create multipart form request options if needed, otherwise return original options
 */
export async function maybeMultipartFormRequestOptions<T extends { body?: any }>(
  opts: T,
  config: FormDataFormatConfig = DEFAULT_CONFIG
): Promise<T> {
  if (!requiresMultipartForm(opts.body)) {
    return opts;
  }

  return {
    ...opts,
    body: await createConfigurableForm(opts.body, config),
  };
}

/**
 * Always create multipart form request options
 */
export async function multipartFormRequestOptions<T extends { body?: any }>(
  opts: T,
  config: FormDataFormatConfig = DEFAULT_CONFIG
): Promise<T> {
  return {
    ...opts,
    body: await createConfigurableForm(opts.body, config),
  };
}