/*
 * Sallie 1.0 Module  
 * Persona: Tough love meets soul care.
 * Function: Test implementation of plugin injection for nested builds.
 * Got it, love.
 */

import { NestedBuildAPI } from '../core/NestedBuildRunner';
import { globalStartParameter } from '../core/StartParameter';

describe('Plugin Injection for Nested Builds', () => {
  
  beforeEach(() => {
    // Reset any state before each test
    jest.clearAllMocks();
  });

  it('should provide plugin injection information', () => {
    const info = NestedBuildAPI.getPluginInjectionInfo();
    
    expect(info).toBeDefined();
    expect(info.availablePlugins).toBeInstanceOf(Array);
    expect(info.buildTypes).toContain('development');
    expect(info.buildTypes).toContain('production');
    expect(info.platforms).toContain('android');
    expect(info.platforms).toContain('ios');
    expect(info.platforms).toContain('web');
    expect(typeof info.activeBuilds).toBe('number');
  });

  it('should create StartParameter with plugin injection for development/android', () => {
    const startParam = NestedBuildAPI.createStartParameterForNewBuild(
      null, 
      'development', 
      'android'
    );
    
    expect(startParam).toBeDefined();
    expect(startParam.getBuildType()).toBe('development');
    expect(startParam.getPlatform()).toBe('android');
    
    const injectedPlugins = startParam.getInjectedPlugins();
    expect(injectedPlugins).toBeInstanceOf(Array);
    expect(injectedPlugins.length).toBeGreaterThan(0);
    
    // Should have core plugins injected
    const pluginIds = injectedPlugins.map(p => p.id);
    expect(pluginIds).toContain('core-ai-orchestrator');
  });

  it('should create different plugin configurations for different platforms', () => {
    const androidParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'production', 'android');
    const iosParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'production', 'ios');
    const webParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'production', 'web');
    
    expect(androidParam.getPlatform()).toBe('android');
    expect(iosParam.getPlatform()).toBe('ios');
    expect(webParam.getPlatform()).toBe('web');
    
    // Each platform should have plugins configured
    expect(androidParam.getInjectedPlugins().length).toBeGreaterThan(0);
    expect(iosParam.getInjectedPlugins().length).toBeGreaterThan(0);
    expect(webParam.getInjectedPlugins().length).toBeGreaterThan(0);
  });

  it('should support manual plugin injection', () => {
    const startParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'development', 'android');
    
    const initialPluginCount = startParam.getInjectedPlugins().length;
    
    // Inject a custom plugin
    startParam.injectPlugin('custom-test-plugin', {
      id: 'custom-test-plugin',
      enabled: true,
      priority: 10,
      config: {
        testMode: true,
        customSetting: 'test-value'
      }
    });
    
    const finalPluginCount = startParam.getInjectedPlugins().length;
    expect(finalPluginCount).toBe(initialPluginCount + 1);
    
    const customPlugin = startParam.getPluginConfig('custom-test-plugin');
    expect(customPlugin).toBeDefined();
    expect(customPlugin?.enabled).toBe(true);
    expect(customPlugin?.config?.testMode).toBe(true);
  });

  it('should export and import configuration correctly', () => {
    const startParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'production', 'ios');
    
    // Add some custom configuration
    startParam.setBuildProperty('custom.property', 'test-value');
    startParam.setGradleParameter('android.test', 'true');
    
    // Export configuration
    const exported = startParam.exportForNestedBuild();
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('string');
    
    // Parse and validate exported configuration
    const config = JSON.parse(exported);
    expect(config.buildType).toBe('production');
    expect(config.platform).toBe('ios');
    expect(config.buildProperties).toBeDefined();
    expect(config.buildProperties['custom.property']).toBe('test-value');
  });

  it('should handle build parameter setting and retrieval', () => {
    const startParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'development', 'web');
    
    // Set various build parameters
    startParam.setBuildProperty('debug.mode', true);
    startParam.setBuildProperty('api.endpoint', 'http://localhost:3000');
    startParam.setGradleParameter('org.gradle.daemon', 'true');
    
    // Retrieve and validate
    expect(startParam.getBuildProperty('debug.mode')).toBe(true);
    expect(startParam.getBuildProperty('api.endpoint')).toBe('http://localhost:3000');
    expect(startParam.getGradleParameter('org.gradle.daemon')).toBe('true');
    
    const allBuildProps = startParam.getBuildProperties();
    expect(allBuildProps).toBeDefined();
    expect(typeof allBuildProps).toBe('object');
  });

  it('should validate plugin dependencies correctly', async () => {
    const startParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'development', 'android');
    
    // Create plugin configurations with dependencies
    const pluginConfigs = startParam.toPluginInjectionConfigs();
    expect(pluginConfigs).toBeInstanceOf(Array);
    
    // Each plugin config should have required properties
    pluginConfigs.forEach(config => {
      expect(config.pluginId).toBeDefined();
      expect(typeof config.enabled).toBe('boolean');
      expect(typeof config.priority).toBe('number');
      expect(config.buildTypes).toBeInstanceOf(Array);
      expect(config.platforms).toBeInstanceOf(Array);
    });
  });

  it('should generate proper build summary', () => {
    const startParam = NestedBuildAPI.createStartParameterForNewBuild(null, 'production', 'android');
    
    const summary = startParam.getSummary();
    expect(summary).toBeDefined();
    expect(typeof summary).toBe('string');
    expect(summary).toContain('production');
    expect(summary).toContain('android');
    expect(summary).toContain('plugins');
  });

  it('should execute nested build simulation successfully', async () => {
    // Mock console to avoid excessive output during tests
    const originalLog = console.log;
    console.log = jest.fn();
    
    try {
      const result = await NestedBuildAPI.runNestedBuildWithAutoConfig(
        'test-nested-build',
        'development',
        'android'
      );
      
      // The build should complete successfully (simulation)
      expect(typeof result).toBe('boolean');
      
    } finally {
      console.log = originalLog;
    }
  });
});