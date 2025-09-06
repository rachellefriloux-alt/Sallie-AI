/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced OpenAI upload integration with configurable nested formats.
 * Got it, love.
 */

import {
  multipartFormRequestOptions,
  maybeMultipartFormRequestOptions,
  NestedFormatOptions,
  DEFAULT_FORMAT_OPTIONS,
} from '../../utils/uploadUtils';

export interface OpenAIUploadOptions {
  purpose: 'fine-tune' | 'assistants' | 'vision' | 'batch';
  file: File | Blob;
  filename?: string;
  formatOptions?: NestedFormatOptions;
}

export interface FileUploadResponse {
  id: string;
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
  status: 'uploaded' | 'processed' | 'error';
  status_details?: string;
}

export interface BatchUploadRequest {
  files: Array<{
    file: File | Blob;
    purpose: string;
    filename?: string;
  }>;
  metadata?: Record<string, any>;
  formatOptions?: NestedFormatOptions;
}

/**
 * Enhanced OpenAI Uploads API client with configurable nested formats
 */
export class OpenAIUploadsIntegration {
  private apiKey: string;
  private baseUrl: string;
  private defaultFormatOptions: NestedFormatOptions;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1', formatOptions?: NestedFormatOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultFormatOptions = { ...DEFAULT_FORMAT_OPTIONS, ...formatOptions };
  }

  /**
   * Upload a single file to OpenAI with configurable formatting
   */
  async uploadFile(options: OpenAIUploadOptions): Promise<FileUploadResponse> {
    const { file, purpose, filename, formatOptions } = options;
    
    const body = {
      file,
      purpose,
      ...(filename && { filename }),
    };

    const requestOptions = await multipartFormRequestOptions(
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body,
      },
      formatOptions || this.defaultFormatOptions
    );

    const response = await fetch(`${this.baseUrl}/files`, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload multiple files in a batch with configurable formatting
   */
  async batchUpload(request: BatchUploadRequest): Promise<FileUploadResponse[]> {
    const { files, metadata, formatOptions } = request;
    
    const body = {
      files: files.map((fileData, index) => ({
        [`file_${index}`]: fileData.file,
        [`purpose_${index}`]: fileData.purpose,
        ...(fileData.filename && { [`filename_${index}`]: fileData.filename }),
      })),
      ...(metadata && { metadata }),
    };

    const requestOptions = await multipartFormRequestOptions(
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body,
      },
      formatOptions || this.defaultFormatOptions
    );

    const response = await fetch(`${this.baseUrl}/files/batch`, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Batch upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload with conditional multipart based on content
   */
  async conditionalUpload(data: Record<string, any>, formatOptions?: NestedFormatOptions): Promise<Response> {
    const requestOptions = await maybeMultipartFormRequestOptions(
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: data,
      },
      formatOptions || this.defaultFormatOptions
    );

    // Handle body serialization and content type for fetch
    let fetchOptions: RequestInit;
    
    if (requestOptions.body instanceof FormData) {
      // For multipart data, remove Content-Type to let browser set it
      fetchOptions = {
        method: requestOptions.method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: requestOptions.body,
      };
    } else {
      // For JSON data, stringify the body
      fetchOptions = {
        method: requestOptions.method,
        headers: requestOptions.headers as HeadersInit,
        body: JSON.stringify(requestOptions.body),
      };
    }

    return fetch(`${this.baseUrl}/chat/completions`, fetchOptions);
  }

  /**
   * Update default format options
   */
  setDefaultFormatOptions(options: NestedFormatOptions): void {
    this.defaultFormatOptions = { ...this.defaultFormatOptions, ...options };
  }

  /**
   * Get current default format options
   */
  getDefaultFormatOptions(): NestedFormatOptions {
    return { ...this.defaultFormatOptions };
  }

  /**
   * Create format options for different API styles
   */
  static createFormatOptions(style: 'openai' | 'php' | 'rails' | 'custom', customOptions?: Partial<NestedFormatOptions>): NestedFormatOptions {
    switch (style) {
      case 'openai':
        return {
          arrayFormat: 'brackets',
          objectFormat: 'brackets',
          maxDepth: 10,
          encodeKeys: false,
          ...customOptions,
        };
      case 'php':
        return {
          arrayFormat: 'brackets',
          objectFormat: 'brackets',
          maxDepth: 10,
          encodeKeys: true,
          ...customOptions,
        };
      case 'rails':
        return {
          arrayFormat: 'brackets',
          objectFormat: 'brackets',
          maxDepth: 10,
          encodeKeys: false,
          ...customOptions,
        };
      case 'custom':
        return {
          ...DEFAULT_FORMAT_OPTIONS,
          ...customOptions,
        };
      default:
        return DEFAULT_FORMAT_OPTIONS;
    }
  }
}