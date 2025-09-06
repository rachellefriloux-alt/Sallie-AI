/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for GodModeManager requirement checks.
 * Got it, love.
 */

import { GodModeManager } from '../core/GodModeManager';
import { IdentityManager } from '../identity/IdentityManager';
import UserPreferencesManager from '../core/UserPreferencesManager';

// Mock the dependencies
jest.mock('../identity/IdentityManager');
jest.mock('../core/UserPreferencesManager');

describe('GodModeManager Requirement Checks', () => {
  let godModeManager: GodModeManager;
  let mockIdentityManager: jest.Mocked<IdentityManager>;
  let mockUserPreferences: jest.Mocked<UserPreferencesManager>;

  beforeEach(() => {
    // Create mocked instances
    mockIdentityManager = new IdentityManager() as jest.Mocked<IdentityManager>;
    mockUserPreferences = new UserPreferencesManager() as jest.Mocked<UserPreferencesManager>;
    
    // Create GodModeManager with mocked dependencies
    godModeManager = new GodModeManager(mockIdentityManager, mockUserPreferences);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('checkActivationRequirements', () => {
    it('should pass when all requirements are met', async () => {
      // Mock authenticated user
      mockIdentityManager.getCurrentUser.mockReturnValue({
        userId: 'test-user',
        userLevel: 'advanced',
        passwordHash: 'hash',
        salt: 'salt',
        created: Date.now()
      });

      // Mock user preferences that allow advanced features
      mockUserPreferences.getPreferences.mockReturnValue({
        phoneControl: {
          enableBatteryOptimization: true,
          enableLocationTracking: false,
          enableNetworkMonitoring: true,
          enableNotificationManagement: true,
          vibrationIntensity: 'medium',
          screenTimeout: 5
        },
        memoryManager: {
          maxCacheSize: 50,
          cacheExpirationTime: 24,
          enableCompression: true,
          enableEncryption: true,
          memoryWarningThreshold: 100,
          autoCleanupInterval: 30
        },
        syncManager: {
          enableAutoSync: true,
          syncInterval: 15,
          maxRetries: 3,
          enableConflictResolution: true,
          syncOnWifiOnly: true,
          enableBackgroundSync: false,
          dataRetentionDays: 30
        },
        ui: {
          theme: 'auto',
          language: 'en',
          enableHaptics: true,
          enableSounds: true,
          fontSize: 'medium'
        },
        privacy: {
          enableAnalytics: true,
          enableCrashReporting: true,
          dataRetentionPeriod: 30,
          shareUsageStats: true
        },
        notifications: {
          enablePushNotifications: true,
          enableInAppNotifications: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        }
      });

      const result = await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(true);
    });

    it('should fail when user is not authenticated', async () => {
      // Mock no authenticated user
      mockIdentityManager.getCurrentUser.mockReturnValue(null);

      const result = await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(result).toBe(false);
      expect(godModeManager.isActive()).toBe(false);
    });

    it('should fail when user identity does not match', async () => {
      // Mock different user
      mockIdentityManager.getCurrentUser.mockReturnValue({
        userId: 'different-user',
        userLevel: 'advanced',
        passwordHash: 'hash',
        salt: 'salt',
        created: Date.now()
      });

      const result = await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(result).toBe(false);
      expect(godModeManager.isActive()).toBe(false);
    });

    it('should fail when user level is insufficient', async () => {
      // Mock basic user level
      mockIdentityManager.getCurrentUser.mockReturnValue({
        userId: 'test-user',
        userLevel: 'basic',
        passwordHash: 'hash',
        salt: 'salt',
        created: Date.now()
      });

      const result = await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(result).toBe(false);
      expect(godModeManager.isActive()).toBe(false);
    });

    it('should fail when required permissions are not granted', async () => {
      // Mock authenticated user
      mockIdentityManager.getCurrentUser.mockReturnValue({
        userId: 'test-user',
        userLevel: 'advanced',
        passwordHash: 'hash',
        salt: 'salt',
        created: Date.now()
      });

      // Mock user preferences that deny permissions
      mockUserPreferences.getPreferences.mockReturnValue({
        phoneControl: {
          enableBatteryOptimization: true,
          enableLocationTracking: false,
          enableNetworkMonitoring: false, // Denies system_control permission
          enableNotificationManagement: true,
          vibrationIntensity: 'medium',
          screenTimeout: 5
        },
        memoryManager: {
          maxCacheSize: 50,
          cacheExpirationTime: 24,
          enableCompression: true,
          enableEncryption: false, // Denies advanced_features permission
          memoryWarningThreshold: 100,
          autoCleanupInterval: 30
        },
        syncManager: {
          enableAutoSync: true,
          syncInterval: 15,
          maxRetries: 3,
          enableConflictResolution: true,
          syncOnWifiOnly: true,
          enableBackgroundSync: false,
          dataRetentionDays: 30
        },
        ui: {
          theme: 'auto',
          language: 'en',
          enableHaptics: true,
          enableSounds: true,
          fontSize: 'medium'
        },
        privacy: {
          enableAnalytics: true,
          enableCrashReporting: true,
          dataRetentionPeriod: 30,
          shareUsageStats: true
        },
        notifications: {
          enablePushNotifications: true,
          enableInAppNotifications: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        }
      });

      const result = await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(result).toBe(false);
      expect(godModeManager.isActive()).toBe(false);
    });

    it('should include warnings for preference restrictions', async () => {
      // Mock authenticated user
      mockIdentityManager.getCurrentUser.mockReturnValue({
        userId: 'test-user',
        userLevel: 'advanced',
        passwordHash: 'hash',
        salt: 'salt',
        created: Date.now()
      });

      // Mock user preferences with some restrictions
      mockUserPreferences.getPreferences.mockReturnValue({
        phoneControl: {
          enableBatteryOptimization: true,
          enableLocationTracking: false,
          enableNetworkMonitoring: true,
          enableNotificationManagement: true,
          vibrationIntensity: 'medium',
          screenTimeout: 5
        },
        memoryManager: {
          maxCacheSize: 50,
          cacheExpirationTime: 24,
          enableCompression: true,
          enableEncryption: true,
          memoryWarningThreshold: 100,
          autoCleanupInterval: 30
        },
        syncManager: {
          enableAutoSync: false, // Should trigger warning
          syncInterval: 15,
          maxRetries: 3,
          enableConflictResolution: true,
          syncOnWifiOnly: true,
          enableBackgroundSync: false,
          dataRetentionDays: 30
        },
        ui: {
          theme: 'auto',
          language: 'en',
          enableHaptics: true,
          enableSounds: true,
          fontSize: 'medium'
        },
        privacy: {
          enableAnalytics: false, // Should trigger warning
          enableCrashReporting: true,
          dataRetentionPeriod: 3, // Short retention, should trigger warning
          shareUsageStats: false
        },
        notifications: {
          enablePushNotifications: true,
          enableInAppNotifications: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        }
      });

      const result = await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(result).toBe(true); // Should still activate but with warnings
      expect(godModeManager.isActive()).toBe(true);
    });
  });

  describe('deactivateGodMode', () => {
    it('should successfully deactivate God-Mode', async () => {
      // First activate
      mockIdentityManager.getCurrentUser.mockReturnValue({
        userId: 'test-user',
        userLevel: 'advanced',
        passwordHash: 'hash',
        salt: 'salt',
        created: Date.now()
      });

      mockUserPreferences.getPreferences.mockReturnValue({
        phoneControl: {
          enableBatteryOptimization: true,
          enableLocationTracking: false,
          enableNetworkMonitoring: true,
          enableNotificationManagement: true,
          vibrationIntensity: 'medium',
          screenTimeout: 5
        },
        memoryManager: {
          maxCacheSize: 50,
          cacheExpirationTime: 24,
          enableCompression: true,
          enableEncryption: true,
          memoryWarningThreshold: 100,
          autoCleanupInterval: 30
        },
        syncManager: {
          enableAutoSync: true,
          syncInterval: 15,
          maxRetries: 3,
          enableConflictResolution: true,
          syncOnWifiOnly: true,
          enableBackgroundSync: false,
          dataRetentionDays: 30
        },
        ui: {
          theme: 'auto',
          language: 'en',
          enableHaptics: true,
          enableSounds: true,
          fontSize: 'medium'
        },
        privacy: {
          enableAnalytics: true,
          enableCrashReporting: true,
          dataRetentionPeriod: 30,
          shareUsageStats: true
        },
        notifications: {
          enablePushNotifications: true,
          enableInAppNotifications: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        }
      });

      await godModeManager.activateGodMode('test-user', 'Test activation');
      expect(godModeManager.isActive()).toBe(true);

      // Then deactivate
      const result = await godModeManager.deactivateGodMode('test-user', 'Test deactivation');
      expect(result).toBe(true);
      expect(godModeManager.isActive()).toBe(false);
    });
  });

  describe('feature management', () => {
    it('should enable and disable features correctly', () => {
      const result = godModeManager.enableFeature('advanced_ai');
      expect(result).toBe(true);
      expect(godModeManager.isFeatureEnabled('advanced_ai')).toBe(false); // Should be false when God-Mode is not active

      const disableResult = godModeManager.disableFeature('advanced_ai');
      expect(disableResult).toBe(true);
    });

    it('should return false for non-existent features', () => {
      const result = godModeManager.enableFeature('non_existent_feature');
      expect(result).toBe(false);
    });
  });
});