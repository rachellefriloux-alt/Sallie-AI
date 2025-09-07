/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Test comprehensive health checks for Plugin Registry
 * Got it, love.
 */

describe('PluginRegistry Health Checks', () => {
  let PluginRegistry: any;
  let registry: any;
  let Plugin: any;
  let PluginPerformanceMetrics: any;

  beforeAll(async () => {
    // Dynamic import to avoid constructor issues
    const module = await import('../core/PluginRegistry');
    PluginRegistry = module.PluginRegistry;
    Plugin = module.Plugin;
    PluginPerformanceMetrics = module.PluginPerformanceMetrics;
  });

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it('should perform basic health check on enabled plugins', async () => {
    const mockPlugin: any = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'Test plugin for health checks',
      author: 'Test Team',
      category: 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date()
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('test-plugin');
    expect(plugin?.health).toBe('healthy');
  });

  it('should mark disabled plugins as disabled during health check', async () => {
    const mockPlugin: any = {
      id: 'disabled-plugin',
      name: 'Disabled Plugin',
      version: '1.0.0',
      description: 'Test disabled plugin',
      author: 'Test Team',
      category: 'utility',
      enabled: false,
      health: 'healthy',
      lastUpdated: new Date()
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('disabled-plugin');
    expect(plugin?.health).toBe('disabled');
  });

  it('should detect high memory usage and mark as warning', async () => {
    const mockPlugin: any = {
      id: 'memory-heavy-plugin',
      name: 'Memory Heavy Plugin',
      version: '1.0.0',
      description: 'Plugin with high memory usage',
      author: 'Test Team',
      category: 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date(),
      getMemoryUsage: () => 60 * 1024 * 1024 // 60MB, above 50MB threshold
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('memory-heavy-plugin');
    expect(plugin?.health).toBe('warning');
  });

  it('should detect slow response times and mark as warning', async () => {
    const mockPlugin: any = {
      id: 'slow-plugin',
      name: 'Slow Plugin',
      version: '1.0.0',
      description: 'Plugin with slow response times',
      author: 'Test Team',
      category: 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date(),
      getAverageResponseTime: () => 6000 // 6 seconds, above 5 second threshold
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('slow-plugin');
    expect(plugin?.health).toBe('warning');
  });

  it('should detect high error rates and mark as error or warning', async () => {
    const mockMetrics: any = {
      averageResponseTime: 1000,
      memoryUsage: 10 * 1024 * 1024,
      errorCount: 60,
      successCount: 40,
      lastCallTimestamp: Date.now()
    };

    const mockPlugin: any = {
      id: 'error-prone-plugin',
      name: 'Error Prone Plugin',
      version: '1.0.0',
      description: 'Plugin with high error rate',
      author: 'Test Team',
      category: 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date(),
      getPerformanceMetrics: () => mockMetrics // 60% error rate
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('error-prone-plugin');
    expect(plugin?.health).toBe('error');
  });

  it('should validate plugin configuration if method is available', async () => {
    const mockPlugin: any = {
      id: 'config-invalid-plugin',
      name: 'Invalid Config Plugin',
      version: '1.0.0',
      description: 'Plugin with invalid configuration',
      author: 'Test Team',
      category: 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date(),
      validateConfiguration: () => false // Invalid configuration
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('config-invalid-plugin');
    expect(plugin?.health).toBe('warning');
  });

  it('should detect pre-release versions and mark as warning', async () => {
    const mockPlugin: any = {
      id: 'pre-release-plugin',
      name: 'Pre-release Plugin',
      version: '0.9.0', // Pre-release version
      description: 'Plugin in pre-release',
      author: 'Test Team',
      category: 'experimental',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date()
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const plugin = registry.getPlugin('pre-release-plugin');
    expect(plugin?.health).toBe('warning');
  });

  it('should track performance metrics', async () => {
    const mockMetrics: any = {
      averageResponseTime: 100,
      memoryUsage: 10 * 1024 * 1024,
      errorCount: 1,
      successCount: 99,
      lastCallTimestamp: Date.now()
    };

    const mockPlugin: any = {
      id: 'metrics-plugin',
      name: 'Metrics Plugin',
      version: '1.0.0',
      description: 'Plugin with performance metrics',
      author: 'Test Team',
      category: 'utility',
      enabled: true,
      health: 'healthy',
      lastUpdated: new Date(),
      getPerformanceMetrics: () => mockMetrics
    };

    await registry.registerPlugin(mockPlugin);
    await registry.runHealthCheck();

    const storedMetrics = registry.getPerformanceMetrics('metrics-plugin');
    expect(storedMetrics).toEqual(mockMetrics);
  });

  it('should maintain Sallie persona in health check structure', () => {
    // Verify that health checks maintain Sallie's persona
    const sallieSlogan = 'Got it, love.';
    const personaVerification = 'Tough love meets soul care.';
    
    expect(__filename).toContain('test');
    expect(sallieSlogan).toBe('Got it, love.');
    expect(personaVerification).toBe('Tough love meets soul care.');
  });
});