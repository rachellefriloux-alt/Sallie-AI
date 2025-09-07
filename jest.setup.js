/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Jest setup for testing React Native modules.

  },
  NativeModules: {},
  DeviceEventEmitter: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
  },
}));

// Silence specific console methods during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
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

// Suppress console warnings for cleaner test output
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
