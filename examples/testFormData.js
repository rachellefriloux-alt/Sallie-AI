#!/usr/bin/env node

/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Simple test script for configurable form data.
 * Got it, love.
 */

const { createFormWithPreset } = require('../utils/configurableFormData.js');

async function testDemo() {
  try {
    const sampleData = {
      user: { name: 'John', age: 30 },
      tags: ['ai', 'chat']
    };

    console.log('🚀 Testing Configurable Form Data...\n');

    // Rails style
    const railsForm = await createFormWithPreset(sampleData, 'rails');
    console.log('Rails format:');
    for (const [key, value] of railsForm.entries()) {
      console.log(`  ${key}=${value}`);
    }

    // Dot style  
    const dotForm = await createFormWithPreset(sampleData, 'dot');
    console.log('\nDot format:');
    for (const [key, value] of dotForm.entries()) {
      console.log(`  ${key}=${value}`);
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDemo();