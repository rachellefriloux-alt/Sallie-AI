/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Example integration of configurable form data utility with OpenAI API.
 * Got it, love.
 */

import { maybeMultipartFormRequestOptions, FORMAT_PRESETS, FormDataFormatConfig } from '../utils/formDataUtils';

/**
 * Enhanced OpenAI API helper with configurable form data support
 */
export class EnhancedOpenAIAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private formDataConfig: FormDataFormatConfig;

  constructor(apiKey: string, formDataConfig: FormDataFormatConfig = FORMAT_PRESETS.php) {
    this.apiKey = apiKey;
    this.formDataConfig = formDataConfig;
  }

  /**
   * Make an API request with configurable form data handling
   */
  async makeRequest(endpoint: string, data: any, options: RequestInit = {}) {
    // Use the configurable form data utility
    const requestOptions = await maybeMultipartFormRequestOptions({
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        ...((options.headers as Record<string, string>) || {}),
      },
      body: data,
      ...options,
    }, this.formDataConfig);

    const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Upload files with structured metadata using configurable formatting
   */
  async uploadWithMetadata(files: File[], metadata: Record<string, any>) {
    return this.makeRequest('/files', {
      files: files,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        formatStyle: this.formDataConfig.style,
      }
    });
  }

  /**
   * Create a fine-tuning job with complex configuration
   */
  async createFineTuningJob(config: {
    trainingFile: File;
    validationFile?: File;
    model: string;
    hyperparameters?: {
      batchSize?: number;
      learningRateMultiplier?: number;
      epochs?: number;
    };
    suffix?: string;
    metadata?: Record<string, any>;
  }) {
    return this.makeRequest('/fine_tuning/jobs', {
      training_file: config.trainingFile,
      validation_file: config.validationFile,
      model: config.model,
      hyperparameters: config.hyperparameters || {},
      suffix: config.suffix,
      metadata: config.metadata || {},
    });
  }

  /**
   * Update the form data configuration
   */
  setFormDataConfig(config: FormDataFormatConfig) {
    this.formDataConfig = config;
  }
}

/**
 * Example usage demonstrating different format styles
 */
export function exampleUsage() {
  // Example 1: Using PHP-style formatting (default)
  const phpAPI = new EnhancedOpenAIAPI('your-api-key');
  
  // Example 2: Using Rails-style formatting for indexed arrays
  const railsAPI = new EnhancedOpenAIAPI('your-api-key', FORMAT_PRESETS.rails);
  
  // Example 3: Using dot notation for flat structure
  const dotAPI = new EnhancedOpenAIAPI('your-api-key', FORMAT_PRESETS.dot);
  
  // Example 4: Custom formatting for specific API requirements
  const customAPI = new EnhancedOpenAIAPI('your-api-key', {
    style: 'custom',
    arrayFormatter: (key, index) => `${key}_item_${index}`,
    objectFormatter: (key, prop) => `${key}__${prop}`,
    maxDepth: 5,
  });

  return { phpAPI, railsAPI, dotAPI, customAPI };
}

/**
 * Practical example: Uploading training data with complex metadata
 */
export async function uploadTrainingData(api: EnhancedOpenAIAPI) {
  const trainingFile = new File(['training data'], 'training.jsonl');
  const validationFile = new File(['validation data'], 'validation.jsonl');
  
  const metadata = {
    project: 'sallie-enhancement',
    tags: ['conversation', 'emotional-intelligence', 'persona'],
    configuration: {
      model: 'gpt-4',
      parameters: {
        temperature: 0.7,
        maxTokens: 150,
      },
      features: ['empathy', 'tough-love', 'growth-mindset'],
    },
    timestamps: {
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  };

  try {
    const result = await api.uploadWithMetadata([trainingFile, validationFile], metadata);
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}