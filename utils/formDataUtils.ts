/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable form data utilities with multiple nested format support.
 * Got it, love.
 */

/**
 * Configuration options for nested format handling in form data
 */
export interface NestedFormatConfig {
  /** How to format array keys */
  arrayFormat: 'indices' | 'brackets' | 'repeat' | 'comma';
  /** How to format object keys */
  objectFormat: 'brackets' | 'dots';
  /** Whether to encode dot characters in keys when using brackets format */
  encodeDotInKeys?: boolean;
  /** Custom delimiter for comma-separated arrays */
  arrayDelimiter?: string;
  /** Whether to append [] to single-item arrays when using comma format */
  commaRoundTrip?: boolean;
}

/**
 * Default configuration that maintains backward compatibility with OpenAI SDK
 */
export const DEFAULT_NESTED_FORMAT_CONFIG: NestedFormatConfig = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets',
  encodeDotInKeys: false,
  arrayDelimiter: ',',
  commaRoundTrip: false,
};

/**
 * Type guard to check if a value is uploadable (similar to OpenAI SDK)
 */
export const isUploadable = (value: any): value is File | Blob | Response => {
  return value !== null && 
    (value instanceof Response || 
     (typeof value === 'object' && typeof value.stream === 'function') ||
     (value instanceof Blob));
};

/**
 * Type guard to check if a value has uploadable content
 */
export const hasUploadableValue = (value: any): boolean => {
  if (isUploadable(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(hasUploadableValue);
  }
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue(value[k])) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Extract filename from various value types
 */
export function getName(value: any): string | undefined {
  if (typeof value === 'object' && value !== null) {
    if ('name' in value && value.name && typeof value.name === 'string') {
      return value.name.split(/[\\/]/).pop();
    }
    if ('url' in value && value.url && typeof value.url === 'string') {
      return value.url.split(/[\\/]/).pop();
    }
    if ('filename' in value && value.filename && typeof value.filename === 'string') {
      return value.filename.split(/[\\/]/).pop();
    }
    if ('path' in value && value.path && typeof value.path === 'string') {
      return value.path.split(/[\\/]/).pop();
    }
  }
  return undefined;
}

/**
 * Format array key based on configuration
 */
function formatArrayKey(baseKey: string, index: number, config: NestedFormatConfig): string {
  switch (config.arrayFormat) {
    case 'indices':
      return `${baseKey}[${index}]`;
    case 'brackets':
      return `${baseKey}[]`;
    case 'repeat':
      return baseKey;
    case 'comma':
      return baseKey; // Comma format is handled differently
    default:
      return `${baseKey}[]`; // fallback to brackets
  }
}

/**
 * Format object key based on configuration
 */
function formatObjectKey(baseKey: string, propertyName: string, config: NestedFormatConfig): string {
  switch (config.objectFormat) {
    case 'brackets':
      if (config.encodeDotInKeys && propertyName.includes('.')) {
        propertyName = propertyName.replace(/\./g, '%2E');
      }
      return `${baseKey}[${propertyName}]`;
    case 'dots':
      return `${baseKey}.${propertyName}`;
    default:
      return `${baseKey}[${propertyName}]`; // fallback to brackets
  }
}

/**
 * Add a value to FormData with configurable nested format support
 */
export async function addFormValue(
  form: FormData, 
  key: string, 
  value: any, 
  config: NestedFormatConfig = DEFAULT_NESTED_FORMAT_CONFIG
): Promise<void> {
  if (value === undefined) {
    return;
  }
  
  if (value === null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }

  // Handle primitive types
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
    return;
  }

  // Handle uploadable content (Files, Blobs, Response objects)
  if (value instanceof Response) {
    const filename = getName(value) || 'unknown_file';
    form.append(key, await value.blob(), filename);
    return;
  }

  if (value instanceof File || value instanceof Blob) {
    const filename = getName(value) || 'unknown_file';
    form.append(key, value, filename);
    return;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (config.arrayFormat === 'comma') {
      // Special handling for comma format
      const stringValues = value.map(v => String(v));
      let finalKey = key;
      
      // Append [] for single items if commaRoundTrip is enabled
      if (config.commaRoundTrip && value.length === 1) {
        finalKey = `${key}[]`;
      }
      
      form.append(finalKey, stringValues.join(config.arrayDelimiter || ','));
      return;
    }

    // Handle other array formats
    await Promise.all(
      value.map(async (entry, index) => {
        const arrayKey = formatArrayKey(key, index, config);
        await addFormValue(form, arrayKey, entry, config);
      })
    );
    return;
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    await Promise.all(
      Object.entries(value).map(async ([name, prop]) => {
        const objectKey = formatObjectKey(key, name, config);
        await addFormValue(form, objectKey, prop, config);
      })
    );
    return;
  }

  throw new TypeError(
    `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${typeof value} instead`
  );
}

/**
 * Create a FormData object from a body with configurable nested formats
 */
export async function createForm(
  body: Record<string, any>, 
  config: NestedFormatConfig = DEFAULT_NESTED_FORMAT_CONFIG
): Promise<FormData> {
  const form = new FormData();
  
  await Promise.all(
    Object.entries(body || {}).map(([key, value]) => 
      addFormValue(form, key, value, config)
    )
  );
  
  return form;
}

/**
 * Create form data with specific array format preset
 */
export async function createFormWithArrayFormat(
  body: Record<string, any>, 
  arrayFormat: NestedFormatConfig['arrayFormat']
): Promise<FormData> {
  const config: NestedFormatConfig = {
    ...DEFAULT_NESTED_FORMAT_CONFIG,
    arrayFormat,
  };
  
  return createForm(body, config);
}

/**
 * Create form data with specific object format preset
 */
export async function createFormWithObjectFormat(
  body: Record<string, any>, 
  objectFormat: NestedFormatConfig['objectFormat']
): Promise<FormData> {
  const config: NestedFormatConfig = {
    ...DEFAULT_NESTED_FORMAT_CONFIG,
    objectFormat,
  };
  
  return createForm(body, config);
}

/**
 * Configuration presets for common use cases
 */
export const NESTED_FORMAT_PRESETS = {
  /** Default OpenAI SDK compatible format */
  OPENAI_COMPATIBLE: DEFAULT_NESTED_FORMAT_CONFIG,
  
  /** PHP/jQuery style with indexed arrays */
  PHP_INDEXED: {
    arrayFormat: 'indices' as const,
    objectFormat: 'brackets' as const,
  },
  
  /** PHP/jQuery style with bracket arrays */
  PHP_BRACKETS: {
    arrayFormat: 'brackets' as const,
    objectFormat: 'brackets' as const,
  },
  
  /** Simple repeat format for arrays */
  SIMPLE_REPEAT: {
    arrayFormat: 'repeat' as const,
    objectFormat: 'brackets' as const,
  },
  
  /** Comma-separated arrays */
  COMMA_SEPARATED: {
    arrayFormat: 'comma' as const,
    objectFormat: 'brackets' as const,
    arrayDelimiter: ',',
  },
  
  /** Dot notation for objects */
  DOT_NOTATION: {
    arrayFormat: 'brackets' as const,
    objectFormat: 'dots' as const,
  },
  
  /** Full dot notation (arrays as indexed, objects as dots) */
  FULL_DOT_NOTATION: {
    arrayFormat: 'indices' as const,
    objectFormat: 'dots' as const,
  },
} as const;

/**
 * Utility function to check if FormData is supported and working correctly
 */
export function checkFormDataSupport(): boolean {
  try {
    const testForm = new FormData();
    testForm.append('test', 'value');
    return testForm.get('test') === 'value';
  } catch (error) {
    return false;
  }
}

/**
 * Convert a flat FormData back to a nested object (basic implementation)
 * Note: This is a simplified parser and may not handle all edge cases
 */
export function parseFormData(formData: FormData): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Array.from(formData.entries())) {
    // Handle bracket notation with empty brackets (arrays)
    if (key.endsWith('[]')) {
      const baseKey = key.slice(0, -2);
      if (!result[baseKey]) {
        result[baseKey] = [];
      }
      result[baseKey].push(value);
    }
    // Handle bracket notation with content
    else if (key.includes('[') && key.includes(']')) {
      const parts = key.split(/[\[\]]+/).filter(Boolean);
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          // Check if next part is numeric (array index)
          const nextPart = parts[i + 1];
          current[part] = /^\d+$/.test(nextPart) ? [] : {};
        }
        current = current[part];
      }
      
      const lastPart = parts[parts.length - 1];
      if (Array.isArray(current)) {
        current[parseInt(lastPart)] = value;
      } else {
        current[lastPart] = value;
      }
    } else if (key.includes('.')) {
      // Simple dot notation parsing
      const parts = key.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
    } else {
      // Simple key-value
      result[key] = value;
    }
  }
  
  return result;
}