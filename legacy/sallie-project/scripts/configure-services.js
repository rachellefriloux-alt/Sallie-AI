#!/usr/bin/env node
/**
 * Service Configuration Script for Sallie AI Companion
 * Configures Firebase, API keys, and other services
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function configureServices() {
  console.log('🤖 Sallie AI Companion - Service Configuration\n');

  try {
    // Check if .env exists
    if (!fs.existsSync('.env')) {
      console.log('📁 Creating .env from .env.example...');
      fs.copyFileSync('.env.example', '.env');
    }

    // Firebase configuration
    const configureFirebase = await question('Configure Firebase? (y/n): ');
    if (configureFirebase.toLowerCase() === 'y') {
      const apiKey = await question('Enter Firebase API Key: ');
      const projectId = await question('Enter Firebase Project ID: ');
      const storageBucket = await question('Enter Firebase Storage Bucket: ');

      // Update .env file
      let envContent = fs.readFileSync('.env', 'utf8');
      envContent = envContent.replace(/FIREBASE_API_KEY=.*/, `FIREBASE_API_KEY=${apiKey}`);
      envContent = envContent.replace(/FIREBASE_PROJECT_ID=.*/, `FIREBASE_PROJECT_ID=${projectId}`);
      envContent = envContent.replace(/FIREBASE_STORAGE_BUCKET=.*/, `FIREBASE_STORAGE_BUCKET=${storageBucket}`);
      fs.writeFileSync('.env', envContent);
      console.log('✅ Firebase configuration updated');
    }

    // AI API configuration
    const configureAI = await question('Configure AI API (OpenAI)? (y/n): ');
    if (configureAI.toLowerCase() === 'y') {
      const aiApiKey = await question('Enter OpenAI API Key: ');
      
      let envContent = fs.readFileSync('.env', 'utf8');
      envContent = envContent.replace(/AI_API_KEY=.*/, `AI_API_KEY=${aiApiKey}`);
      fs.writeFileSync('.env', envContent);
      console.log('✅ AI API configuration updated');
    }

    // Copy Firebase config files if they exist
    const copyConfigs = await question('Copy Firebase config files? (y/n): ');
    if (copyConfigs.toLowerCase() === 'y') {
      // Android
      if (fs.existsSync('android/app/google-services.json.example')) {
        const androidPath = 'android/app/google-services.json';
        if (!fs.existsSync(androidPath)) {
          fs.copyFileSync('android/app/google-services.json.example', androidPath);
          console.log('📱 Created android/app/google-services.json (update with your values)');
        }
      }

      // iOS
      if (fs.existsSync('ios/GoogleService-Info.plist.example')) {
        const iosPath = 'ios/GoogleService-Info.plist';
        if (!fs.existsSync(iosPath)) {
          fs.copyFileSync('ios/GoogleService-Info.plist.example', iosPath);
          console.log('🍎 Created ios/GoogleService-Info.plist (update with your values)');
        }
      }

      // Web
      if (fs.existsSync('web/src/firebase-config.example.js')) {
        const webPath = 'web/src/firebase-config.js';
        if (!fs.existsSync(webPath)) {
          fs.copyFileSync('web/src/firebase-config.example.js', webPath);
          console.log('🌐 Created web/src/firebase-config.js (update with your values)');
        }
      }
    }

    console.log('\n🎉 Service configuration completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Update the created config files with your actual values');
    console.log('2. Run "npm run ios" or "npm run android" to start development');
    console.log('3. Check the README.md for detailed setup instructions');

  } catch (error) {
    console.error('❌ Error during configuration:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

configureServices();