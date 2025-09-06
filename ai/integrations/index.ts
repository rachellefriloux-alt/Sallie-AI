/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Exports for configurable uploads system.
 * Got it, love.
 */

// Core uploads manager with configurable nested formats
export {
  UploadsManager,
  createUploadsManager,
  defaultUploadsManager,
  DEFAULT_NESTED_CONFIG,
  type NestedFormatConfig,
  type UploadableFile
} from './UploadsManager';

// Enhanced OpenAI integration with uploads
export { EnhancedOpenAIIntegration } from './EnhancedOpenAIIntegration';

// Examples and demonstrations
export { demonstrateNestedFormats, exampleOpenAIIntegration } from './UploadsExamples';