/*
 * Salle 1.0 Module
 * Test: Routine Progress Navigation Implementation
 * Persona: Tough love meets soul care.
 * Got it, love.
 */

describe('RoutineProgressScreen Implementation', () => {
  it('should exist as a file', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../app/routine-progress.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should follow Salle 1.0 module pattern', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../app/routine-progress.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check for Salle 1.0 module header
    expect(fileContent).toContain('* Salle 1.0 Module');
    expect(fileContent).toContain('* Persona: Tough love meets soul care.');
    expect(fileContent).toContain('* Got it, love.');
  });

  it('should have proper React component structure', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../app/routine-progress.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check for essential React component patterns
    expect(fileContent).toContain('import React');
    expect(fileContent).toContain('export default');
    expect(fileContent).toContain('const RoutineProgressScreen');
    expect(fileContent).toContain('useRouter');
    expect(fileContent).toContain('useLocalSearchParams');
  });
});

describe('DeviceControlDemo Navigation Integration', () => {
  it('should have navigation logic implemented in voice command handler', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../features/feature/device/DeviceControlDemoActivity.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Verify the TODO comment was removed and navigation was implemented
    expect(fileContent).not.toContain('TODO: Implement navigation to routine progress');
    expect(fileContent).toContain('router.push');
    expect(fileContent).toContain('routine-progress');
    expect(fileContent).toContain('useRouter');
    expect(fileContent).toContain("pathname: '/routine-progress'");
  });

  it('should maintain proper imports and component structure', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../features/feature/device/DeviceControlDemoActivity.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check that useRouter import is added
    expect(fileContent).toContain("import { useRouter } from 'expo-router'");
    
    // Check that router is initialized in component
    expect(fileContent).toContain('const router = useRouter()');
  });
});