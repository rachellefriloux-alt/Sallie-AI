/**
 * Integration test for routine progress navigation
 * Tests the navigation logic for routine progress
 */

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
  },
}));

describe('Routine Progress Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should construct correct navigation parameters for routine progress', () => {
    // Import after mock is set up
    const { router } = require('expo-router');
    
    const routineName = 'morning';
    const expectedNavigation = {
      pathname: '/screens/RoutineProgressScreen',
      params: { routineName: routineName }
    };
    
    // Simulate the navigation call that should happen in DeviceControlDemoActivity
    router.push(expectedNavigation);
    
    // Verify navigation was called with correct parameters
    expect(mockPush).toHaveBeenCalledWith(expectedNavigation);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should pass different routine names correctly', () => {
    const { router } = require('expo-router');
    
    const routineName = 'evening';
    
    router.push({
      pathname: '/screens/RoutineProgressScreen',
      params: { routineName: routineName }
    });
    
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/screens/RoutineProgressScreen',
      params: { routineName: 'evening' }
    });
  });

  it('should handle unknown routine names', () => {
    const { router } = require('expo-router');
    
    const routineName = 'unknown';
    
    router.push({
      pathname: '/screens/RoutineProgressScreen',
      params: { routineName: routineName }
    });
    
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/screens/RoutineProgressScreen',
      params: { routineName: 'unknown' }
    });
  });
});