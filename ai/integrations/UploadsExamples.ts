/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Example usage of configurable nested formats in uploads.
 * Got it, love.
 */

import { UploadsManager, createUploadsManager } from './UploadsManager';

/**
 * Example demonstrating different nested format configurations
 */
async function demonstrateNestedFormats() {
  console.log('🚀 Demonstrating Configurable Nested Formats for Uploads\n');

  // Sample data with complex nesting
  const sampleData = {
    user: {
      name: 'Sallie',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    },
    tags: ['ai', 'companion', 'emotional-intelligence'],
    files: [
      { name: 'profile.jpg', type: 'image' },
      { name: 'settings.json', type: 'config' }
    ]
  };

  // 1. Default configuration (brackets format)
  console.log('1️⃣ Default Configuration (Brackets):');
  const defaultManager = new UploadsManager();
  const defaultForm = await defaultManager.createForm(sampleData);
  console.log('Generated form fields:');
  (defaultForm as any).getEntries().forEach(([key, value]: [string, any]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log();

  // 2. Indexed arrays with dot notation objects
  console.log('2️⃣ Indexed Arrays + Dot Notation Objects:');
  const indexedManager = createUploadsManager({
    arrayFormat: 'indexed',
    objectFormat: 'dot'
  });
  const indexedForm = await indexedManager.createForm(sampleData);
  console.log('Generated form fields:');
  (indexedForm as any).getEntries().forEach(([key, value]: [string, any]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log();

  // 3. Comma-separated arrays with custom object format
  console.log('3️⃣ Comma Arrays + Custom Object Format:');
  const customManager = createUploadsManager({
    arrayFormat: 'comma',
    objectFormat: 'custom',
    objectCustomFormat: '{key}__{prop}'
  });
  const customForm = await customManager.createForm(sampleData);
  console.log('Generated form fields:');
  (customForm as any).getEntries().forEach(([key, value]: [string, any]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log();

  // 4. Custom array format with brackets objects
  console.log('4️⃣ Custom Array Format + Brackets Objects:');
  const advancedManager = createUploadsManager({
    arrayFormat: 'custom',
    arrayCustomFormat: '{key}_item_{index}',
    objectFormat: 'brackets'
  });
  const advancedForm = await advancedManager.createForm(sampleData);
  console.log('Generated form fields:');
  (advancedForm as any).getEntries().forEach(([key, value]: [string, any]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log();

  // 5. Demonstrating depth limits
  console.log('5️⃣ Depth Limit Protection:');
  const shallowManager = createUploadsManager({ maxDepth: 2 });
  const deepData = {
    level1: {
      level2: {
        level3: {
          level4: 'This should fail'
        }
      }
    }
  };
  
  try {
    await shallowManager.createForm(deepData);
    console.log('❌ Depth limit was not enforced!');
  } catch (error) {
    console.log(`✅ Depth limit enforced: ${(error as Error).message}`);
  }
  console.log();

  console.log('🎉 All examples completed successfully!');
}

/**
 * Example of integrating with OpenAI file uploads
 */
async function exampleOpenAIIntegration() {
  console.log('📁 Example: OpenAI File Upload Integration\n');

  // Create manager with API-friendly format
  const apiManager = createUploadsManager({
    arrayFormat: 'indexed',
    objectFormat: 'dot',
    maxDepth: 5
  });

  const uploadData = {
    file: new File(['AI training data'], 'training.jsonl'),
    purpose: 'fine-tune',
    metadata: {
      project: 'sallie-enhancement',
      version: '1.0',
      tags: ['emotional-intelligence', 'conversation']
    }
  };

  try {
    // Process the upload data
    const requestOptions = await apiManager.maybeMultipartFormRequestOptions({
      method: 'POST',
      body: uploadData
    });

    console.log('✅ Upload data processed successfully');
    console.log('Request would include FormData with these fields:');
    (requestOptions.body as any).getEntries().forEach(([key, value]: [string, any]) => {
      if (value instanceof File) {
        console.log(`  ${key}: [File: ${value.name}]`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
  } catch (error) {
    console.log(`❌ Error processing upload: ${(error as Error).message}`);
  }
}

// Export for use in other modules
export { demonstrateNestedFormats, exampleOpenAIIntegration };

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateNestedFormats()
    .then(() => exampleOpenAIIntegration())
    .catch(console.error);
}