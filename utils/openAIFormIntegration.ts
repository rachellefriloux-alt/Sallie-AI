/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Example integration of configurable form data utils with OpenAI client.
 * Got it, love.
 */

import { 
  createForm, 
  addFormValue, 
  NESTED_FORMAT_PRESETS,
  type NestedFormatConfig 
} from '../utils/formDataUtils';

/**
 * Enhanced OpenAI client integration with configurable nested formats
 * This demonstrates how the configurable form data utility addresses the TODO
 * found in the OpenAI SDK package files.
 */
export class ConfigurableOpenAIClient {
  private nestedFormatConfig: NestedFormatConfig;

  constructor(config: Partial<NestedFormatConfig> = {}) {
    // Default to OpenAI-compatible format for backward compatibility
    this.nestedFormatConfig = {
      ...NESTED_FORMAT_PRESETS.OPENAI_COMPATIBLE,
      ...config
    };
  }

  /**
   * Create multipart form data with configurable nested formats
   * This replaces the hardcoded nested format behavior in the original OpenAI SDK
   */
  async createMultipartForm(body: Record<string, any>): Promise<FormData> {
    return createForm(body, this.nestedFormatConfig);
  }

  /**
   * File upload with configurable nested formats
   * Example usage of the new configurable form data functionality
   */
  async uploadFile(params: {
    file: File | Blob;
    purpose: string;
    metadata?: Record<string, any>;
    options?: {
      timeout?: number;
      signal?: AbortSignal;
    };
  }): Promise<any> {
    const { file, purpose, metadata, options } = params;

    // Build the request body with potentially nested metadata
    const body = {
      file,
      purpose,
      ...(metadata && { metadata })
    };

    // Use configurable form data creation
    const formData = await this.createMultipartForm(body);

    // Make the API request
    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      body: formData,
      signal: options?.signal,
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fine-tuning job creation with complex nested parameters
   * Demonstrates handling of deeply nested configuration objects
   */
  async createFineTuningJob(params: {
    model: string;
    training_file: string;
    validation_file?: string;
    hyperparameters?: {
      batch_size?: number;
      learning_rate_multiplier?: number;
      n_epochs?: number;
    };
    suffix?: string;
    integrations?: Array<{
      type: string;
      wandb?: {
        project: string;
        name?: string;
        entity?: string;
        tags?: string[];
      };
    }>;
  }): Promise<any> {
    // This demonstrates how nested objects and arrays are now configurable
    const formData = await this.createMultipartForm(params);

    const response = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fine-tuning job creation failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update the nested format configuration
   */
  setNestedFormatConfig(config: Partial<NestedFormatConfig>): void {
    this.nestedFormatConfig = { ...this.nestedFormatConfig, ...config };
  }

  /**
   * Get current nested format configuration
   */
  getNestedFormatConfig(): NestedFormatConfig {
    return { ...this.nestedFormatConfig };
  }
}

/**
 * Factory functions for common OpenAI client configurations
 */
export const createOpenAIClient = {
  /**
   * Standard OpenAI client with default (backward-compatible) formatting
   */
  standard(): ConfigurableOpenAIClient {
    return new ConfigurableOpenAIClient(NESTED_FORMAT_PRESETS.OPENAI_COMPATIBLE);
  },

  /**
   * Client configured for PHP-style backends
   */
  phpCompatible(): ConfigurableOpenAIClient {
    return new ConfigurableOpenAIClient(NESTED_FORMAT_PRESETS.PHP_INDEXED);
  },

  /**
   * Client with dot notation for flat object structures
   */
  dotNotation(): ConfigurableOpenAIClient {
    return new ConfigurableOpenAIClient(NESTED_FORMAT_PRESETS.DOT_NOTATION);
  },

  /**
   * Client with comma-separated arrays for simple backends
   */
  commaSeparated(): ConfigurableOpenAIClient {
    return new ConfigurableOpenAIClient(NESTED_FORMAT_PRESETS.COMMA_SEPARATED);
  },

  /**
   * Custom client with user-defined configuration
   */
  custom(config: NestedFormatConfig): ConfigurableOpenAIClient {
    return new ConfigurableOpenAIClient(config);
  }
};

/**
 * Example usage scenarios
 */
export const examples = {
  /**
   * Example 1: File upload with metadata using different formats
   */
  async fileUploadExample() {
    // Standard format (brackets): metadata[tags][]=ai&metadata[tags][]=ml
    const standardClient = createOpenAIClient.standard();
    
    // PHP format (indexed): metadata[tags][0]=ai&metadata[tags][1]=ml  
    const phpClient = createOpenAIClient.phpCompatible();
    
    // Dot notation: metadata.tags[]=ai&metadata.tags[]=ml
    const dotClient = createOpenAIClient.dotNotation();

    const file = new File(['training data'], 'training.jsonl');
    const metadata = {
      tags: ['ai', 'ml', 'training'],
      project: {
        name: 'Sallie Enhancement',
        version: '1.0'
      }
    };

    // Each client will format the nested metadata differently
    const results = await Promise.all([
      standardClient.uploadFile({ file, purpose: 'fine-tune', metadata }),
      phpClient.uploadFile({ file, purpose: 'fine-tune', metadata }),
      dotClient.uploadFile({ file, purpose: 'fine-tune', metadata })
    ]);

    return results;
  },

  /**
   * Example 2: Fine-tuning with complex nested configuration
   */
  async fineTuningExample() {
    const client = createOpenAIClient.custom({
      arrayFormat: 'comma',
      objectFormat: 'dots',
      arrayDelimiter: '|'
    });

    const params = {
      model: 'gpt-3.5-turbo',
      training_file: 'file-abc123',
      hyperparameters: {
        batch_size: 8,
        learning_rate_multiplier: 0.1,
        n_epochs: 3
      },
      integrations: [{
        type: 'wandb',
        wandb: {
          project: 'sallie-training',
          entity: 'sallie-ai',
          tags: ['emotion', 'personality', 'voice']
        }
      }]
    };

    // This will use custom formatting:
    // hyperparameters.batch_size=8
    // integrations[0].wandb.tags=emotion|personality|voice
    return client.createFineTuningJob(params);
  },

  /**
   * Example 3: Dynamic configuration switching
   */
  async dynamicConfigExample() {
    const client = createOpenAIClient.standard();

    // Switch to PHP format for legacy backend compatibility
    client.setNestedFormatConfig(NESTED_FORMAT_PRESETS.PHP_INDEXED);

    // Switch to comma-separated for simple processing
    client.setNestedFormatConfig({
      arrayFormat: 'comma',
      objectFormat: 'dots',
      commaRoundTrip: true
    });

    // Get current configuration
    const currentConfig = client.getNestedFormatConfig();
    console.log('Current format config:', currentConfig);

    return currentConfig;
  }
};

/**
 * Migration helper for existing OpenAI SDK usage
 * This provides a drop-in replacement for the TODO functionality
 */
export async function migrateOpenAISdkFormHandling(
  originalBody: Record<string, any>,
  config?: NestedFormatConfig
): Promise<FormData> {
  // Replace the hardcoded OpenAI SDK addFormValue behavior
  // with configurable nested format support
  return createForm(originalBody, config || NESTED_FORMAT_PRESETS.OPENAI_COMPATIBLE);
}

export default ConfigurableOpenAIClient;