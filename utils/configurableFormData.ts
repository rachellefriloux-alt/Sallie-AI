/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable nested form data formatting utility.
 * Got it, love.
 */

/**
 * Configuration options for nested form data formatting
 */
export interface NestedFormatConfig {
  /** Format for array indices */
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'none';
  /** Format for object properties */
  objectFormat: 'brackets' | 'dot' | 'underscore';
  /** Custom separator for array elements when using comma format */
  arraySeparator?: string;
  /** Custom bracket style for array format */
  arrayBrackets?: { open: string; close: string };
  /** Custom property separator for object format */
  objectSeparator?: string;
}

/**
 * Default format configuration (matches current hardcoded behavior)
 */
export const DEFAULT_FORMAT_CONFIG: NestedFormatConfig = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets',
  arraySeparator: ',',
  arrayBrackets: { open: '[', close: ']' },
  objectSeparator: '.',
};

/**
 * Predefined format configurations for common API styles
 */
export const FORMAT_PRESETS = {
  /** Rails/PHP style: user[name], items[] */
  rails: {
    arrayFormat: 'brackets' as const,
    objectFormat: 'brackets' as const,
  },
  /** Dot notation: user.name, items.0 */
  dot: {
    arrayFormat: 'indexed' as const,
    objectFormat: 'dot' as const,
    objectSeparator: '.',
  },
  /** Underscore notation: user_name, items_0 */
  underscore: {
    arrayFormat: 'indexed' as const,
    objectFormat: 'underscore' as const,
    objectSeparator: '_',
  },
  /** Comma separated arrays: items=a,b,c */
  comma: {
    arrayFormat: 'comma' as const,
    objectFormat: 'brackets' as const,
    arraySeparator: ',',
  },
} as const;

/**
 * Generate formatted key for array elements
 */
function formatArrayKey(baseKey: string, index: number, config: NestedFormatConfig): string {
  switch (config.arrayFormat) {
    case 'brackets':
      const { open, close } = config.arrayBrackets || { open: '[', close: ']' };
      return `${baseKey}${open}${close}`;
    case 'indexed':
      const separator = config.objectSeparator || '.';
      return `${baseKey}${separator}${index}`;
    case 'comma':
      // For comma format, we'll handle this differently in the main function
      return baseKey;
    case 'none':
      return baseKey;
    default:
      return `${baseKey}[]`;
  }
}

/**
 * Generate formatted key for object properties
 */
function formatObjectKey(baseKey: string, propertyName: string, config: NestedFormatConfig): string {
  switch (config.objectFormat) {
    case 'brackets':
      return `${baseKey}[${propertyName}]`;
    case 'dot':
      return `${baseKey}.${propertyName}`;
    case 'underscore':
      return `${baseKey}_${propertyName}`;
    default:
      return `${baseKey}[${propertyName}]`;
  }
}

/**
 * Type guard to check if a value is a named blob (has name property)
 */
function isNamedBlob(value: unknown): value is Blob & { name: string } {
  return value instanceof Blob && 'name' in value && typeof (value as any).name === 'string';
}

/**
 * Type guard to check if a value is uploadable (Response, AsyncIterable, or named Blob)
 */
function isUploadable(value: unknown): boolean {
  return typeof value === 'object' &&
    value !== null &&
    (value instanceof Response || 
     (value != null && typeof value === 'object' && typeof (value as any)[Symbol.asyncIterator] === 'function') ||
     isNamedBlob(value));
}

/**
 * Add a form value with configurable nested formatting
 */
export async function addFormValue(
  form: FormData,
  key: string,
  value: unknown,
  config: NestedFormatConfig = DEFAULT_FORMAT_CONFIG
): Promise<void> {
  if (value === undefined) return;
  
  if (value == null) {
    throw new TypeError(
      `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`
    );
  }

  // Handle primitive types
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
    return;
  }

  // Handle uploadable types (Response, AsyncIterable, named Blob)
  if (isUploadable(value)) {
    if (value instanceof Response) {
      // For Response objects, we'd need to implement makeFile function
      // For now, throw an error as this requires additional dependencies
      throw new Error('Response objects not yet supported in this implementation');
    } else if (isNamedBlob(value)) {
      form.append(key, value, (value as any).name);
      return;
    }
    // AsyncIterable would also need special handling
    throw new Error('AsyncIterable objects not yet supported in this implementation');
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (config.arrayFormat === 'comma') {
      // Special handling for comma-separated format
      const stringValues = value
        .filter(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
        .map(item => String(item));
      if (stringValues.length > 0) {
        form.append(key, stringValues.join(config.arraySeparator || ','));
      }
      
      // Handle non-primitive items recursively
      const nonPrimitiveItems = value.filter(item => 
        typeof item === 'object' && item !== null
      );
      for (let i = 0; i < nonPrimitiveItems.length; i++) {
        const arrayKey = formatArrayKey(key, i, config);
        await addFormValue(form, arrayKey, nonPrimitiveItems[i], config);
      }
    } else {
      // Handle other array formats
      for (let i = 0; i < value.length; i++) {
        const arrayKey = formatArrayKey(key, i, config);
        await addFormValue(form, arrayKey, value[i], config);
      }
    }
    return;
  }

  // Handle objects
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    for (const [propertyName, propertyValue] of entries) {
      const objectKey = formatObjectKey(key, propertyName, config);
      await addFormValue(form, objectKey, propertyValue, config);
    }
    return;
  }

  throw new TypeError(
    `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${typeof value} instead`
  );
}

/**
 * Create a FormData object from a body with configurable nested formatting
 */
export async function createConfigurableForm<T = Record<string, unknown>>(
  body: T | undefined,
  config: NestedFormatConfig = DEFAULT_FORMAT_CONFIG
): Promise<FormData> {
  const form = new FormData();
  
  if (!body) return form;
  
  const entries = Object.entries(body);
  await Promise.all(
    entries.map(([key, value]) => addFormValue(form, key, value, config))
  );
  
  return form;
}

/**
 * Utility function to create form data with a specific preset configuration
 */
export async function createFormWithPreset<T = Record<string, unknown>>(
  body: T | undefined,
  preset: keyof typeof FORMAT_PRESETS
): Promise<FormData> {
  const config = { ...DEFAULT_FORMAT_CONFIG, ...FORMAT_PRESETS[preset] };
  return createConfigurableForm(body, config);
}

/**
 * Check if an object contains any uploadable values (for conditional multipart handling)
 */
export function hasUploadableValue(value: unknown): boolean {
  if (isUploadable(value)) return true;
  
  if (Array.isArray(value)) {
    return value.some(hasUploadableValue);
  }
  
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue((value as any)[k])) return true;
    }
  }
  
  return false;
}