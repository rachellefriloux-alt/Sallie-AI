// import 'jest-extended'; // Removed - not installed

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    manifest: {
      version: '1.0.0'
    }
  }
}));

jest.mock('expo-device', () => ({
  default: {
    brand: 'TestBrand',
    modelName: 'TestModel'
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
  multiRemove: jest.fn()
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-notification-id'),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getPresentedNotificationsAsync: jest.fn().mockResolvedValue([]),
  dismissAllNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() })
}));

// Mock Expo Network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    type: 'wifi'
  }),
  addNetworkStateListener: jest.fn().mockReturnValue({ remove: jest.fn() })
}));

// Mock Expo FileSystem
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/',
  cacheDirectory: 'file:///test/cache/',
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  readDirectoryAsync: jest.fn().mockResolvedValue([])
}));

// Mock React Native modules that might cause issues
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn()
}));

// Global test utilities
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};

// Mock timers
jest.useFakeTimers();

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children
  })
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children
  })
}));
