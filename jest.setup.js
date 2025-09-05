<<<<<<< Updated upstream
<<<<<<< Updated upstream
/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Jest setup for testing React Native modules.
 * Got it, love.
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock expo-battery
jest.mock('expo-battery', () => ({
  addBatteryStateListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getBatteryLevelAsync: jest.fn(() => Promise.resolve(0.75)),
  getBatteryStateAsync: jest.fn(() => Promise.resolve(2)), // CHARGING = 2
  isLowPowerModeEnabledAsync: jest.fn(() => Promise.resolve(false)),
  BatteryState: {
    CHARGING: 2,
    FULL: 3,
    UNPLUGGED: 1,
    UNKNOWN: 0,
  },
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  addNetworkStateListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  NetworkStateType: {
    NONE: 'none',
    WIFI: 'wifi',
    CELLULAR: 'cellular',
    ETHERNET: 'ethernet',
    BLUETOOTH: 'bluetooth',
    VPN: 'vpn',
    OTHER: 'other',
    UNKNOWN: 'unknown',
  },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn(),
  })),
  Accuracy: {
    High: 4,
    Balanced: 3,
    Low: 2,
    Lowest: 1,
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  modelId: 'test-device',
  deviceName: 'Test Device',
  osVersion: '1.0.0',
}));

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android || obj.default),
  },
  DeviceEventEmitter: {
    emit: jest.fn(),
  },
  PermissionsAndroid: {
    requestMultiple: jest.fn(() => Promise.resolve({})),
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',
      WRITE_SETTINGS: 'android.permission.WRITE_SETTINGS',
    },
  },
  NativeModules: {},
}));

// Mock expo-intent-launcher
jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Suppress console warnings for cleaner test output
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
