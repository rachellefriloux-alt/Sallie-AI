/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for GodModeManager emergency override functionality.
 * Got it, love.
 */

import { godModeManager, GodModeState, GodModeFeature } from '../core/GodModeManager';

// Mock console to capture logs during testing
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

describe('GodModeManager Emergency Override', () => {
  beforeEach(() => {
    // Reset GodModeManager state before each test
    jest.clearAllMocks();
    
    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('performSystemAction with emergency_override', () => {
    it('should perform full reset emergency override when God-Mode is active', async () => {
      // Arrange: Activate God-Mode and enable some features
      await godModeManager.activateGodMode('test-user', 'Testing emergency override');
      godModeManager.enableFeature('device_control');
      godModeManager.enableFeature('security_bypass');
      
      expect(godModeManager.isActive()).toBe(true);
      expect(godModeManager.getEnabledFeatures().length).toBeGreaterThan(0);
      
      // Act: Perform emergency override
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'full_reset',
        reason: 'Test emergency reset'
      });
      
      // Assert: Should succeed and reset system
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(false);
      expect(godModeManager.getEnabledFeatures().length).toBe(0);
      
      // Verify emergency logs
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨 EMERGENCY OVERRIDE INITIATED')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Emergency override completed successfully')
      );
    });

    it('should perform safe mode emergency override', async () => {
      // Arrange: Activate God-Mode with multiple features
      await godModeManager.activateGodMode('test-user', 'Testing safe mode');
      godModeManager.enableFeature('device_control');
      godModeManager.enableFeature('security_bypass');
      godModeManager.enableFeature('unlimited_memory');
      
      // Act: Perform safe mode override
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'safe_mode',
        reason: 'Test safe mode activation'
      });
      
      // Assert: Should succeed and enable only safe features
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(true);
      
      const enabledFeatures = godModeManager.getEnabledFeatures();
      expect(enabledFeatures.length).toBe(1);
      expect(enabledFeatures[0].id).toBe('system_diagnostics');
      
      // Verify safe mode logs
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🛡️ Safe mode enabled - diagnostics only')
      );
    });

    it('should perform emergency access override with bypass', async () => {
      // Arrange: Activate God-Mode
      await godModeManager.activateGodMode('test-user', 'Testing emergency access');
      
      // Act: Perform emergency access with bypass
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'emergency_access',
        bypassRestrictions: true,
        reason: 'Test emergency access bypass'
      });
      
      // Assert: Should succeed and enable emergency features
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(true);
      
      const enabledFeatures = godModeManager.getEnabledFeatures();
      const featureIds = enabledFeatures.map(f => f.id);
      expect(featureIds).toContain('advanced_ai');
      expect(featureIds).toContain('system_diagnostics');
      
      // Check restrictions were cleared
      const state = godModeManager.getState();
      expect(state.restrictions).toEqual([]);
      
      // Verify emergency access logs
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🆘 Emergency access granted - restrictions bypassed')
      );
    });

    it('should perform lockdown emergency override', async () => {
      // Arrange: Activate God-Mode with features
      await godModeManager.activateGodMode('test-user', 'Testing lockdown');
      godModeManager.enableFeature('advanced_ai');
      
      // Act: Perform lockdown override
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'lockdown',
        reason: 'Test emergency lockdown'
      });
      
      // Assert: Should succeed and lockdown everything
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(false);
      expect(godModeManager.getEnabledFeatures().length).toBe(0);
      
      const state = godModeManager.getState();
      expect(state.restrictions).toContain('emergency_lockdown_active');
      
      // Verify lockdown logs
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔐 Emergency lockdown activated - all systems secured')
      );
    });

    it('should handle unknown override type with fallback to full reset', async () => {
      // Arrange: Activate God-Mode
      await godModeManager.activateGodMode('test-user', 'Testing unknown type');
      
      // Act: Perform override with unknown type
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'unknown_type',
        reason: 'Test unknown override type'
      });
      
      // Assert: Should succeed and perform full reset
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(false);
      
      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Unknown override type: unknown_type')
      );
    });

    it('should handle emergency override when God-Mode is not active', async () => {
      // Arrange: Ensure God-Mode is not active
      await godModeManager.deactivateGodMode('test-user', 'Ensure deactivated');
      expect(godModeManager.isActive()).toBe(false);
      
      // Act: Try to perform emergency override
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'full_reset',
        reason: 'Test when not active'
      });
      
      // Assert: Should not perform action due to God-Mode not being active
      expect(result).toBe(false);
      
      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot perform system action: God-Mode not active'
      );
    });

    it('should use default parameters when none provided', async () => {
      // Arrange: Activate God-Mode
      await godModeManager.activateGodMode('test-user', 'Testing defaults');
      
      // Act: Perform emergency override without parameters
      const result = await godModeManager.performSystemAction('emergency_override');
      
      // Assert: Should succeed with default full reset
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(false);
      
      // Verify default settings were used
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄 Full system reset completed')
      );
    });
  });

  describe('Emergency Override Logging', () => {
    it('should log comprehensive emergency override details', async () => {
      // Arrange: Activate God-Mode and enable features
      await godModeManager.activateGodMode('test-user', 'Testing logging');
      godModeManager.enableFeature('advanced_ai');
      
      // Clear previous console calls to focus on emergency override logs
      consoleLogSpy.mockClear();
      
      // Act: Perform emergency override
      const result = await godModeManager.performSystemAction('emergency_override', {
        type: 'safe_mode',
        reason: 'Testing comprehensive logging'
      });
      
      // Debug: Log all console calls to understand what's being logged
      const allCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      console.log('All console.log calls:', allCalls);
      
      // Assert: Should have logged pre and post states
      expect(result).toBe(true);
      
      // Check if any of the calls contain the expected strings
      const hasPreStateLog = allCalls.some(call => call.includes('Pre-override state captured'));
      const hasPostStateLog = allCalls.some(call => call.includes('Post-override state'));
      const hasEmergencyLog = allCalls.some(call => call.includes('Emergency override logged'));
      
      expect(hasPreStateLog).toBe(true);
      expect(hasPostStateLog).toBe(true);
      expect(hasEmergencyLog).toBe(true);
    });
  });
});