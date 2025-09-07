import 'jest-expo/jest-preset';
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock expo modules that might not be available in test environment
jest.mock('expo-constants', () => ({
  default: {
    manifest: {},
    platform: {
      ios: null,
      android: { package: 'com.yourorg.sallie' },
    },
  },
}));

jest.mock('expo-device', () => ({
  getDeviceTypeAsync: jest.fn().mockResolvedValue('PHONE'),
  getSystemVersionAsync: jest.fn().mockResolvedValue('13.0'),
  isDevice: true,
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/',
  cacheDirectory: 'file:///test/cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  deleteAsync: jest.fn().mockResolvedValue(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(),
  deleteItemAsync: jest.fn().mockResolvedValue(),
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  default: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
  default: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInAnonymously: jest.fn().mockResolvedValue({ user: { uid: 'test-user' } }),
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn().mockResolvedValue(),
        get: jest.fn().mockResolvedValue({ exists: false }),
        update: jest.fn().mockResolvedValue(),
        delete: jest.fn().mockResolvedValue(),
      })),
      where: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      })),
      add: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
    })),
  })),
}));

jest.mock('@react-native-firebase/storage', () => ({
  default: jest.fn(() => ({
    ref: jest.fn(() => ({
      putFile: jest.fn().mockResolvedValue({}),
      getDownloadURL: jest.fn().mockResolvedValue('https://test-url.com'),
    })),
  })),
}));

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      const mockTx = {
        executeSql: jest.fn((sql, params, success) => {
          if (success) success(mockTx, { rows: { length: 0, item: jest.fn() } });
        }),
      };
      callback(mockTx);
    }),
  })),
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
}));

// Mock expo-av for audio/video
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue(),
      playAsync: jest.fn().mockResolvedValue(),
      pauseAsync: jest.fn().mockResolvedValue(),
      stopAsync: jest.fn().mockResolvedValue(),
      unloadAsync: jest.fn().mockResolvedValue(),
      setPositionAsync: jest.fn().mockResolvedValue(),
      getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(),
  },
  Video: jest.fn().mockImplementation(() => ({
    loadAsync: jest.fn().mockResolvedValue(),
    playAsync: jest.fn().mockResolvedValue(),
    pauseAsync: jest.fn().mockResolvedValue(),
    stopAsync: jest.fn().mockResolvedValue(),
    unloadAsync: jest.fn().mockResolvedValue(),
  })),
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn().mockResolvedValue(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([]),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: jest.fn().mockImplementation(() => null),
  CameraType: {
    back: 'back',
    front: 'front',
  },
  FlashMode: {
    off: 'off',
    on: 'on',
    auto: 'auto',
  },
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }),
  watchPositionAsync: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationHandler: jest.fn(),
}));

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  getAssetsAsync: jest.fn().mockResolvedValue({ assets: [] }),
  createAssetAsync: jest.fn().mockResolvedValue({ id: 'test-asset-id' }),
}));

// Mock expo-contacts
jest.mock('expo-contacts', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  getContactsAsync: jest.fn().mockResolvedValue({ data: [] }),
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    type: 'WIFI',
    isConnected: true,
    isInternetReachable: true,
  }),
}));

// Mock expo-battery
jest.mock('expo-battery', () => ({
  getBatteryLevelAsync: jest.fn().mockResolvedValue(0.8),
  getBatteryStateAsync: jest.fn().mockResolvedValue('CHARGING'),
  addBatteryStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-task-manager
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskDefined: jest.fn().mockReturnValue(false),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn().mockResolvedValue('granted'),
  check: jest.fn().mockResolvedValue('granted'),
  PERMISSIONS: {
    ANDROID: {
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      CAMERA: 'android.permission.CAMERA',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}));

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn(() => ({})),
  runOnJS: jest.fn((fn) => fn),
  interpolate: jest.fn(() => 0),
  Extrapolate: {
    CLAMP: 'clamp',
  },
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Rect: 'Rect',
  Path: 'Path',
  G: 'G',
  Text: 'Text',
  TSpan: 'TSpan',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const mockDayjs = jest.fn(() => ({
    format: jest.fn(() => '2024-01-01'),
    add: jest.fn(() => ({
      format: jest.fn(() => '2024-01-02'),
    })),
    subtract: jest.fn(() => ({
      format: jest.fn(() => '2023-12-31'),
    })),
    isBefore: jest.fn(() => false),
    isAfter: jest.fn(() => false),
  }));

  mockDayjs.extend = jest.fn();
  mockDayjs.locale = jest.fn();

  return {
    __esModule: true,
    default: mockDayjs,
  };
});

// Mock zustand
jest.mock('zustand', () => ({
  create: jest.fn((fn) => {
    const store = fn(
      (set, get) => ({
        ...fn(() => ({}), () => ({})),
        set,
        get,
      }),
      () => ({})
    );
    return store;
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'exp://localhost:8081'),
  openURL: jest.fn().mockResolvedValue(),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///test/image.jpg' }],
  }),
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///test/image.jpg' }],
  }),
  MediaTypeOptions: {
    All: 'All',
    Videos: 'Videos',
    Images: 'Images',
  },
}));

// Mock expo-intent-launcher
jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn().mockResolvedValue(),
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  applicationId: 'com.yourorg.sallie',
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

// Mock expo-system-ui
jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn().mockResolvedValue(),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(),
  hideAsync: jest.fn().mockResolvedValue(),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  SymbolView: 'SymbolView',
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Provider: 'Provider',
  Text: 'Text',
  Button: 'Button',
  Card: 'Card',
  Surface: 'Surface',
  Appbar: 'Appbar',
  useTheme: jest.fn(() => ({
    colors: {
      primary: '#6200ee',
      accent: '#03dac4',
    },
  })),
}));

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Button: 'Button',
  Text: 'Text',
  Card: 'Card',
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-bootsplash
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(),
  show: jest.fn().mockResolvedValue(),
  getVisibilityStatus: jest.fn().mockResolvedValue('hidden'),
}));

// Global test utilities
global.fetch = jest.fn();

// Mock timers
jest.useFakeTimers();
