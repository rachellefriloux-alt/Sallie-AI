/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Test suite for GodModeManager system actions implementation.
 * Got it, love.
 */

import { godModeManager } from '../core/GodModeManager';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  
  // Reset God Mode state before each test
  if (godModeManager.isActive()) {
    godModeManager.deactivateGodMode('test');
  }
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

describe('GodModeManager System Actions', () => {
  describe('performSystemAction', () => {
    it('should return false when God Mode is not active', async () => {
      const result = await godModeManager.performSystemAction('deep_analysis');
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Cannot perform system action: God-Mode not active');
    });

    it('should return false for unknown actions', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      const result = await godModeManager.performSystemAction('unknown_action');
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Unknown God-Mode action: unknown_action');
    });

    it('should handle deep_analysis action when God Mode is active', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      const result = await godModeManager.performSystemAction('deep_analysis');
      expect(result).toBe(true);
    });

    it('should handle system_optimization action when God Mode is active', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      const result = await godModeManager.performSystemAction('system_optimization');
      expect(result).toBe(true);
    });

    it('should handle emergency_override action when God Mode is active', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      const result = await godModeManager.performSystemAction('emergency_override');
      expect(result).toBe(true);
    });
  });

  describe('performDeepAnalysis', () => {
    it('should perform analysis with system diagnostics feature disabled', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      // Disable the system diagnostics feature
      godModeManager.disableFeature('system_diagnostics');
      
      const result = await godModeManager.performSystemAction('deep_analysis');
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('System diagnostics feature not enabled for deep analysis');
    });

    it('should perform analysis successfully with system diagnostics enabled', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      godModeManager.enableFeature('system_diagnostics');
      
      const result = await godModeManager.performSystemAction('deep_analysis');
      expect(result).toBe(true);
    });

    it('should handle analysis with target parameter', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      godModeManager.enableFeature('system_diagnostics');
      
      const result = await godModeManager.performSystemAction('deep_analysis', { target: 'memory' });
      expect(result).toBe(true);
    });
  });

  describe('performSystemOptimization', () => {
    it('should perform optimization successfully', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('system_optimization');
      expect(result).toBe(true);
    });

    it('should handle targeted memory optimization', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('system_optimization', { target: 'memory' });
      expect(result).toBe(true);
    });

    it('should handle aggressive optimization', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('system_optimization', { aggressiveOptimization: true });
      expect(result).toBe(true);
    });
  });

  describe('performEmergencyOverride', () => {
    it('should perform general emergency override', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('emergency_override');
      expect(result).toBe(true);
    });

    it('should handle system failure emergency', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('emergency_override', { 
        type: 'system_failure',
        severity: 'critical',
        userId: 'test_user'
      });
      expect(result).toBe(true);
    });

    it('should handle critical user assistance emergency', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('emergency_override', { 
        type: 'critical_user_assistance',
        severity: 'high'
      });
      expect(result).toBe(true);
    });

    it('should handle security threat emergency', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('emergency_override', { 
        type: 'security_threat',
        severity: 'critical'
      });
      expect(result).toBe(true);
    });

    it('should handle performance critical emergency', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      const result = await godModeManager.performSystemAction('emergency_override', { 
        type: 'performance_critical',
        severity: 'high'
      });
      expect(result).toBe(true);
    });
  });

  describe('Integration with existing features', () => {
    it('should enable features during optimization', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      // Disable a high-impact feature first
      godModeManager.disableFeature('advanced_ai');
      expect(godModeManager.isFeatureEnabled('advanced_ai')).toBe(false);
      
      // Run optimization
      await godModeManager.performSystemAction('system_optimization');
      
      // Check if high-impact feature was enabled
      expect(godModeManager.isFeatureEnabled('advanced_ai')).toBe(true);
    });

    it('should activate emergency features during override', async () => {
      await godModeManager.activateGodMode('test', 'testing');
      
      // Disable emergency features first
      godModeManager.disableFeature('advanced_ai');
      godModeManager.disableFeature('unlimited_memory');
      
      // Run emergency override
      await godModeManager.performSystemAction('emergency_override', { type: 'critical_user_assistance' });
      
      // Check if emergency features were activated
      expect(godModeManager.isFeatureEnabled('advanced_ai')).toBe(true);
      expect(godModeManager.isFeatureEnabled('unlimited_memory')).toBe(true);
    });
  });
});