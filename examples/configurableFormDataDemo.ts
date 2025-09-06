/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Example integration showing configurable form data in action.
 * Got it, love.
 */

import {
  createFormWithPreset,
  createConfigurableForm,
  addFormValue,
  NestedFormatConfig,
  FORMAT_PRESETS
} from '../utils/configurableFormData';

/**
 * Example demonstrating the solution to the TODO: "make nested formats configurable"
 * Originally from packages/package/package_uploads.js.3.diff.txt
 */
export class ConfigurableFormDataExample {
  
  /**
   * Demonstrates the old hardcoded behavior vs new configurable behavior
   */
  static async demonstrateFormattingStyles() {
    const sampleData = {
      user: {
        name: 'John Doe',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      },
      tags: ['ai', 'chat', 'assistant'],
      metadata: {
        version: '1.0',
        features: ['voice', 'text', 'memory']
      }
    };

    console.log('=== Configurable Form Data Formatting Demo ===\n');

    // Rails style (matches original hardcoded behavior)
    console.log('1. Rails/PHP Style (Original Hardcoded Behavior):');
    const railsForm = await createFormWithPreset(sampleData, 'rails');
    this.logFormData(railsForm);

    // Dot notation style
    console.log('\n2. Dot Notation Style:');
    const dotForm = await createFormWithPreset(sampleData, 'dot');
    this.logFormData(dotForm);

    // Underscore style
    console.log('\n3. Underscore Style:');
    const underscoreForm = await createFormWithPreset(sampleData, 'underscore');
    this.logFormData(underscoreForm);

    // Comma-separated arrays
    console.log('\n4. Comma-Separated Arrays:');
    const commaForm = await createFormWithPreset(sampleData, 'comma');
    this.logFormData(commaForm);

    // Custom configuration
    console.log('\n5. Custom Configuration:');
    const customConfig: NestedFormatConfig = {
      arrayFormat: 'indexed',
      objectFormat: 'dot',
      objectSeparator: '_',
      arrayBrackets: { open: '(', close: ')' }
    };
    const customForm = await createConfigurableForm(sampleData, customConfig);
    this.logFormData(customForm);

    return {
      railsForm,
      dotForm,
      underscoreForm,
      commaForm,
      customForm
    };
  }

  /**
   * Helper to log FormData contents
   */
  private static logFormData(formData: FormData) {
    const entries: string[] = [];
    for (const [key, value] of formData.entries()) {
      entries.push(`${key}=${value}`);
    }
    entries.forEach(entry => console.log(`  ${entry}`));
  }

  /**
   * Demonstrates migration from hardcoded implementation
   */
  static async demonstrateMigration() {
    console.log('\n=== Migration Example ===\n');

    const form = new FormData();
    const testData = {
      files: [{ name: 'doc1.pdf' }, { name: 'doc2.pdf' }],
      metadata: { author: 'John', version: 1 }
    };

    console.log('Before (Hardcoded - from package_uploads.js.3.diff.txt):');
    console.log('// This was the hardcoded implementation:');
    console.log('// if (Array.isArray(value)) {');
    console.log('//   await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));');
    console.log('// } else if (typeof value === "object") {');
    console.log('//   await Promise.all(Object.entries(value).map(([name, prop]) =>');
    console.log('//     addFormValue(form, `${key}[${name}]`, prop)'));
    console.log('// }');

    console.log('\nAfter (Configurable):');
    console.log('// Now you can choose the format:');
    
    // Default (same as before)
    await addFormValue(form, 'files', testData.files);
    await addFormValue(form, 'metadata', testData.metadata);
    console.log('Default format (same as hardcoded):');
    this.logFormData(form);

    // Or use different formats
    const form2 = new FormData();
    await addFormValue(form2, 'files', testData.files, FORMAT_PRESETS.dot);
    await addFormValue(form2, 'metadata', testData.metadata, FORMAT_PRESETS.dot);
    console.log('\nDot notation format:');
    this.logFormData(form2);
  }

  /**
   * Demonstrates API integration scenarios
   */
  static async demonstrateAPIIntegration() {
    console.log('\n=== API Integration Scenarios ===\n');

    const uploadData = {
      document: {
        title: 'My Document',
        type: 'pdf',
        metadata: {
          pages: 10,
          size: '2MB'
        }
      },
      tags: ['important', 'draft'],
      settings: {
        public: false,
        downloadable: true
      }
    };

    // Different APIs require different formats
    console.log('1. Rails API (user[name], items[]):');
    const railsRequest = await createFormWithPreset(uploadData, 'rails');
    this.logFormData(railsRequest);

    console.log('\n2. REST API with dot notation (user.name, items.0):');
    const restRequest = await createFormWithPreset(uploadData, 'dot');
    this.logFormData(restRequest);

    console.log('\n3. Legacy API with underscores (user_name, items_0):');
    const legacyRequest = await createFormWithPreset(uploadData, 'underscore');
    this.logFormData(legacyRequest);

    return { railsRequest, restRequest, legacyRequest };
  }
}

// Example usage function for testing
export async function runConfigurableFormDataDemo() {
  try {
    console.log('🚀 Running Configurable Form Data Demo...\n');
    
    await ConfigurableFormDataExample.demonstrateFormattingStyles();
    await ConfigurableFormDataExample.demonstrateMigration();
    await ConfigurableFormDataExample.demonstrateAPIIntegration();
    
    console.log('\n✅ Demo completed successfully!');
    console.log('\nThis demonstrates the solution to the TODO: "make nested formats configurable"');
    console.log('from packages/package/package_uploads.js.3.diff.txt');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}