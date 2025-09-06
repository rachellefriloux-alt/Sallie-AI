/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Build parameter system similar to Gradle's StartParameter for plugin injection.
 * Got it, love.
 */

import { PluginInjectionConfig } from './BuildConfigurationManager';

export interface StartParameterPlugin {
  id: string;
  enabled: boolean;
  config?: Record<string, any>;
  priority?: number;
}

/**
 * StartParameter equivalent for Sallie's build system
 * This implements the concept from the TODO to inject plugins via StartParameter
 */
export class StartParameter {
  private buildType: 'development' | 'production' | 'preview' = 'development';
  private platform: 'android' | 'ios' | 'web' | 'all' = 'all';
  private taskNames: string[] = [];
  private projectDir: string = process.cwd();
  private buildName?: string;
  private injectedPlugins: Map<string, StartParameterPlugin> = new Map();
  private buildProperties: Map<string, any> = new Map();
  private gradleParameters: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    // Set default build properties
    this.buildProperties.set('org.gradle.daemon', 'true');
    this.buildProperties.set('org.gradle.parallel', 'true');
    this.buildProperties.set('org.gradle.configureondemand', 'true');
    
    // Set default injected plugins for development
    this.injectPlugin('core-ai-orchestrator', {
      id: 'core-ai-orchestrator',
      enabled: true,
      priority: 1
    });
  }

  /**
   * Inject a plugin into the build (implements the main TODO functionality)
   */
  injectPlugin(pluginId: string, plugin: StartParameterPlugin): void {
    this.injectedPlugins.set(pluginId, {
      ...plugin,
      id: pluginId
    });
    console.log(`[StartParameter] Injected plugin: ${pluginId}`);
  }

  /**
   * Remove an injected plugin
   */
  removePlugin(pluginId: string): boolean {
    const removed = this.injectedPlugins.delete(pluginId);
    if (removed) {
      console.log(`[StartParameter] Removed plugin: ${pluginId}`);
    }
    return removed;
  }

  /**
   * Get all injected plugins
   */
  getInjectedPlugins(): StartParameterPlugin[] {
    return Array.from(this.injectedPlugins.values())
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  /**
   * Check if a plugin is injected
   */
  hasPlugin(pluginId: string): boolean {
    return this.injectedPlugins.has(pluginId);
  }

  /**
   * Get injected plugin configuration
   */
  getPluginConfig(pluginId: string): StartParameterPlugin | undefined {
    return this.injectedPlugins.get(pluginId);
  }

  /**
   * Set build type
   */
  setBuildType(buildType: 'development' | 'production' | 'preview'): void {
    this.buildType = buildType;
    
    // Auto-inject platform-specific plugins based on build type
    this.autoInjectPluginsForBuildType(buildType);
  }

  /**
   * Get build type
   */
  getBuildType(): string {
    return this.buildType;
  }

  /**
   * Set target platform
   */
  setPlatform(platform: 'android' | 'ios' | 'web' | 'all'): void {
    this.platform = platform;
    
    // Auto-inject platform-specific plugins
    this.autoInjectPluginsForPlatform(platform);
  }

  /**
   * Get target platform
   */
  getPlatform(): string {
    return this.platform;
  }

  /**
   * Set task names to execute
   */
  setTaskNames(tasks: string[] | string): void {
    this.taskNames = Array.isArray(tasks) ? tasks : [tasks];
  }

  /**
   * Get task names
   */
  getTaskNames(): string[] {
    return [...this.taskNames];
  }

  /**
   * Set project directory
   */
  setCurrentDir(dir: string): void {
    this.projectDir = dir;
  }

  /**
   * Get current directory
   */
  getCurrentDir(): string {
    return this.projectDir;
  }

  /**
   * Set build name for nested builds
   */
  setBuildName(name: string): void {
    this.buildName = name;
  }

  /**
   * Get build name
   */
  getBuildName(): string | undefined {
    return this.buildName;
  }

  /**
   * Set a build property (similar to Gradle properties)
   */
  setBuildProperty(key: string, value: any): void {
    this.buildProperties.set(key, value);
  }

  /**
   * Get a build property
   */
  getBuildProperty(key: string): any {
    return this.buildProperties.get(key);
  }

  /**
   * Get all build properties
   */
  getBuildProperties(): Record<string, any> {
    return Object.fromEntries(this.buildProperties);
  }

  /**
   * Set Gradle parameter (for Android builds)
   */
  setGradleParameter(key: string, value: string): void {
    this.gradleParameters.set(key, value);
  }

  /**
   * Get Gradle parameter
   */
  getGradleParameter(key: string): string | undefined {
    return this.gradleParameters.get(key);
  }

  /**
   * Get all Gradle parameters
   */
  getGradleParameters(): Record<string, string> {
    return Object.fromEntries(this.gradleParameters);
  }

  /**
   * Auto-inject plugins based on build type
   */
  private autoInjectPluginsForBuildType(buildType: string): void {
    switch (buildType) {
      case 'development':
        this.injectPlugin('voice-visualization', {
          id: 'voice-visualization',
          enabled: true,
          priority: 3,
          config: { debugMode: true }
        });
        this.injectPlugin('predictive-analytics', {
          id: 'predictive-analytics',
          enabled: false,
          priority: 5
        });
        break;
        
      case 'production':
        this.injectPlugin('real-time-processing', {
          id: 'real-time-processing',
          enabled: true,
          priority: 4,
          config: { optimization: 'aggressive' }
        });
        // Remove development-only plugins
        this.removePlugin('voice-visualization');
        break;
        
      case 'preview':
        this.injectPlugin('emotional-intelligence', {
          id: 'emotional-intelligence',
          enabled: true,
          priority: 2,
          config: { previewMode: true }
        });
        break;
    }
  }

  /**
   * Auto-inject plugins based on platform
   */
  private autoInjectPluginsForPlatform(platform: string): void {
    switch (platform) {
      case 'android':
        this.setGradleParameter('android.useAndroidX', 'true');
        this.setGradleParameter('android.enableJetifier', 'true');
        this.setBuildProperty('expo.modules.autolinking.android', 'true');
        break;
        
      case 'ios':
        this.setBuildProperty('expo.modules.autolinking.ios', 'true');
        this.setBuildProperty('ios.deploymentTarget', '13.0');
        break;
        
      case 'web':
        this.setBuildProperty('expo.web.bundler', 'metro');
        // Remove native-only plugins for web
        this.removePlugin('voice-visualization');
        break;
    }
  }

  /**
   * Convert to PluginInjectionConfig array for use with PluginInjectionManager
   */
  toPluginInjectionConfigs(): PluginInjectionConfig[] {
    return this.getInjectedPlugins().map(plugin => ({
      pluginId: plugin.id,
      enabled: plugin.enabled,
      priority: plugin.priority || 0,
      buildTypes: [this.buildType],
      platforms: [this.platform],
      config: plugin.config
    }));
  }

  /**
   * Create a copy of this StartParameter for nested builds
   */
  copy(): StartParameter {
    const copy = new StartParameter();
    copy.buildType = this.buildType;
    copy.platform = this.platform;
    copy.taskNames = [...this.taskNames];
    copy.projectDir = this.projectDir;
    copy.buildName = this.buildName;
    
    // Copy injected plugins
    this.injectedPlugins.forEach((plugin, id) => {
      copy.injectedPlugins.set(id, { ...plugin });
    });
    
    // Copy build properties
    this.buildProperties.forEach((value, key) => {
      copy.buildProperties.set(key, value);
    });
    
    // Copy Gradle parameters
    this.gradleParameters.forEach((value, key) => {
      copy.gradleParameters.set(key, value);
    });
    
    return copy;
  }

  /**
   * Export configuration for external build tools
   */
  exportForNestedBuild(): string {
    return JSON.stringify({
      buildType: this.buildType,
      platform: this.platform,
      taskNames: this.taskNames,
      projectDir: this.projectDir,
      buildName: this.buildName,
      injectedPlugins: Array.from(this.injectedPlugins.values()),
      buildProperties: this.getBuildProperties(),
      gradleParameters: this.getGradleParameters(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import configuration from external source
   */
  importFromNestedBuild(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      
      this.buildType = config.buildType || 'development';
      this.platform = config.platform || 'all';
      this.taskNames = config.taskNames || [];
      this.projectDir = config.projectDir || process.cwd();
      this.buildName = config.buildName;
      
      // Import injected plugins
      if (config.injectedPlugins) {
        this.injectedPlugins.clear();
        config.injectedPlugins.forEach((plugin: StartParameterPlugin) => {
          this.injectedPlugins.set(plugin.id, plugin);
        });
      }
      
      // Import build properties
      if (config.buildProperties) {
        Object.entries(config.buildProperties).forEach(([key, value]) => {
          this.buildProperties.set(key, value);
        });
      }
      
      // Import Gradle parameters
      if (config.gradleParameters) {
        Object.entries(config.gradleParameters).forEach(([key, value]) => {
          this.gradleParameters.set(key, value as string);
        });
      }
      
      return true;
    } catch (error) {
      console.error('[StartParameter] Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Get a summary of current configuration
   */
  getSummary(): string {
    const pluginCount = this.injectedPlugins.size;
    const enabledPlugins = Array.from(this.injectedPlugins.values()).filter(p => p.enabled).length;
    
    return `StartParameter[${this.buildType}-${this.platform}]: ${enabledPlugins}/${pluginCount} plugins, ${this.taskNames.length} tasks`;
  }
}

/**
 * Create a new StartParameter instance for a nested build
 * This is the main factory function that implements the TODO functionality
 */
export function createStartParameterForNestedBuild(
  buildType: 'development' | 'production' | 'preview' = 'development',
  platform: 'android' | 'ios' | 'web' | 'all' = 'all'
): StartParameter {
  const startParameter = new StartParameter();
  startParameter.setBuildType(buildType);
  startParameter.setPlatform(platform);
  
  console.log(`[StartParameter] Created for nested build: ${startParameter.getSummary()}`);
  return startParameter;
}

/**
 * Global instance for build-time plugin injection
 */
export const globalStartParameter = new StartParameter();