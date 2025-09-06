/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced OpenAI integration with configurable uploads functionality.
 * Got it, love.
 */

import { OpenAIIntegration } from '../OpenAIIntegration.js';
import { UploadsManager, createUploadsManager, NestedFormatConfig } from './UploadsManager';

/**
 * Enhanced OpenAI integration with configurable uploads support
 */
export class EnhancedOpenAIIntegration extends OpenAIIntegration {
    private uploadsManager: UploadsManager;

    constructor(uploadsConfig?: Partial<NestedFormatConfig>) {
        super();
        // Initialize uploads manager with configurable formats
        this.uploadsManager = uploadsConfig ? createUploadsManager(uploadsConfig) : new UploadsManager();
    }

    /**
     * Update uploads configuration for nested formats
     */
    updateUploadsConfig(config: Partial<NestedFormatConfig>): void {
        this.uploadsManager.updateConfig(config);
    }

    /**
     * Get current uploads configuration
     */
    getUploadsConfig(): NestedFormatConfig {
        return this.uploadsManager.getConfig();
    }

    /**
     * Upload file to OpenAI with configurable form formatting
     */
    async uploadFile(file: File, purpose: string, metadata?: Record<string, any>): Promise<any> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not available');
        }

        const uploadData: Record<string, any> = {
            file,
            purpose
        };

        // Add metadata if provided, using configurable nested formatting
        if (metadata) {
            uploadData.metadata = metadata;
        }

        try {
            const requestOptions = await this.uploadsManager.multipartFormRequestOptions({
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: uploadData
            });

            const response = await fetch(`${this.baseUrl}/files`, requestOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI file upload error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`File upload failed: ${(error as Error).message}`);
        }
    }

    /**
     * Create upload session for large files with configurable formatting
     */
    async createUpload(filename: string, purpose: string, bytes: number, mimeType?: string): Promise<any> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not available');
        }

        const uploadData: Record<string, any> = {
            filename,
            purpose,
            bytes
        };

        if (mimeType) {
            uploadData.mime_type = mimeType;
        }

        try {
            const requestOptions = await this.uploadsManager.maybeMultipartFormRequestOptions({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: uploadData
            });

            const response = await fetch(`${this.baseUrl}/uploads`, requestOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI upload creation error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Upload creation failed: ${(error as Error).message}`);
        }
    }

    /**
     * Add part to upload session with configurable formatting
     */
    async addUploadPart(uploadId: string, data: Blob | ArrayBuffer, partNumber: number): Promise<any> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not available');
        }

        const partData = {
            data,
            part_number: partNumber
        };

        try {
            const requestOptions = await this.uploadsManager.multipartFormRequestOptions({
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: partData
            });

            const response = await fetch(`${this.baseUrl}/uploads/${uploadId}/parts`, requestOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI upload part error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Upload part failed: ${(error as Error).message}`);
        }
    }

    /**
     * Complete upload session
     */
    async completeUpload(uploadId: string, partIds: string[]): Promise<any> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not available');
        }

        try {
            const response = await fetch(`${this.baseUrl}/uploads/${uploadId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    part_ids: partIds
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI upload completion error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Upload completion failed: ${(error as Error).message}`);
        }
    }

    /**
     * Upload file for fine-tuning with complex metadata structure
     */
    async uploadForFineTuning(
        file: File, 
        metadata: {
            project: string;
            version: string;
            tags: string[];
            config: {
                model: string;
                epochs: number;
                learningRate: number;
            };
        }
    ): Promise<any> {
        // This demonstrates how the configurable nested formats handle complex structures
        return this.uploadFile(file, 'fine-tune', metadata);
    }
}