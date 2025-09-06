/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Build configuration management with plugin injection support.
 * Got it, love.
 */

export interface BuildParameter {
  key: string;
  value: any;
  scope: 'global' | 'android' | 'ios' | 'web';
  buildType?: 'development' | 'production' | 'preview';
}

export interface PluginInjectionConfig {
  pluginId: string;
  enabled: boolean;
  priority: number;
  buildTypes: string[];
  platforms: string[];
  config?: Record<string, any>;
  dependencies?: string[];
}

export interface BuildConfiguration {
  buildType: 'development' | 'production' | 'preview';
  platform: 'android' | 'ios' | 'web' | 'all';
  plugins: PluginInjectionConfig[];
  parameters: BuildParameter[];
  timestamp: Date;
}

export class BuildConfigurationManager {
  private configurations: Map<string, BuildConfiguration> = new Map();
  private currentBuildParams: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultConfigurations();
  }

  private initializeDefaultConfigurations(): void {
    // Development configuration with core plugins
    const developmentConfig: BuildConfiguration = {
      buildType: 'development',
      platform: 'all',
      plugins: [
        {
          pluginId: 'core-ai-orchestrator',
          enabled: true,
          priority: 1,
          buildTypes: ['development', 'production', 'preview'],
          platforms: ['android', 'ios', 'web']
        },
        {
          pluginId: 'advanced-theming',
          enabled: true,
          priority: 2,
          buildTypes: ['development', 'production'],
          platforms: ['android', 'ios', 'web']
        },
        {
          pluginId: 'voice-visualization',
          enabled: true,
          priority: 3,
          buildTypes: ['development'],
          platforms: ['android', 'ios'],
          dependencies: ['audio-processing']
        },
        {
          pluginId: 'emotional-intelligence',
          enabled: true,
          priority: 4,
          buildTypes: ['development', 'production'],
          platforms: ['android', 'ios', 'web']
        }
      ],
      parameters: [
        {
          key: 'DEBUG_MODE',
          value: true,
          scope: 'global',
          buildType: 'development'
        },
        {
          key: 'API_ENDPOINT',
          value: 'http://localhost:3000',
          scope: 'global',
          buildType: 'development'
        }
      ],
      timestamp: new Date()
    };

    // Production configuration with optimized plugins
    const productionConfig: BuildConfiguration = {
      buildType: 'production',
      platform: 'all',
      plugins: [
        {
          pluginId: 'core-ai-orchestrator',
          enabled: true,
          priority: 1,
          buildTypes: ['production'],
          platforms: ['android', 'ios', 'web']
        },
        {
          pluginId: 'advanced-theming',
          enabled: true,
          priority: 2,
          buildTypes: ['production'],
          platforms: ['android', 'ios', 'web']
        },
        {
          pluginId: 'emotional-intelligence',
          enabled: true,
          priority: 3,
          buildTypes: ['production'],
          platforms: ['android', 'ios', 'web']
        },
        {
          pluginId: 'real-time-processing',
          enabled: true,
          priority: 4,
          buildTypes: ['production'],
          platforms: ['android', 'ios'],
          config: {
            optimization: 'aggressive',
            caching: true
          }
        }
      ],
      parameters: [
        {
          key: 'DEBUG_MODE',
          value: false,
          scope: 'global',
          buildType: 'production'
        },
        {
          key: 'API_ENDPOINT',
          value: 'https://api.sallie.ai',
          scope: 'global',
          buildType: 'production'
        },
        {
          key: 'ANALYTICS_ENABLED',
          value: true,
          scope: 'global',
          buildType: 'production'
        }
      ],
      timestamp: new Date()
    };

    this.configurations.set('development-all', developmentConfig);
    this.configurations.set('production-all', productionConfig);
  }

  /**
   * Get build configuration for specific build type and platform
   */
  getBuildConfiguration(buildType: string, platform: string): BuildConfiguration | null {
    const key = `${buildType}-${platform}`;
    return this.configurations.get(key) || this.configurations.get(`${buildType}-all`) || null;
  }

  /**
   * Set build parameter that can be injected into nested builds
   */
  setBuildParameter(key: string, value: any, scope: 'global' | 'android' | 'ios' | 'web' = 'global'): void {
    this.currentBuildParams.set(`${scope}:${key}`, value);
  }

  /**
   * Get build parameter for injection
   */
  getBuildParameter(key: string, scope: 'global' | 'android' | 'ios' | 'web' = 'global'): any {
    return this.currentBuildParams.get(`${scope}:${key}`);
  }

  /**
   * Get all build parameters for a specific scope
   */
  getBuildParametersForScope(scope: 'global' | 'android' | 'ios' | 'web'): Map<string, any> {
    const scopedParams = new Map<string, any>();
    
    this.currentBuildParams.forEach((value, key) => {
      if (key.startsWith(`${scope}:`)) {
        const paramKey = key.substring(scope.length + 1);
        scopedParams.set(paramKey, value);
      }
    });

    return scopedParams;
  }

  /**
   * Get plugins that should be injected for specific build configuration
   */
  getPluginsForInjection(buildType: string, platform: string): PluginInjectionConfig[] {
    const config = this.getBuildConfiguration(buildType, platform);
    if (!config) return [];

    return config.plugins
      .filter(plugin => 
        plugin.enabled &&
        plugin.buildTypes.includes(buildType) &&
        (plugin.platforms.includes(platform) || plugin.platforms.includes('all'))
      )
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Register a new build configuration
   */
  registerBuildConfiguration(config: BuildConfiguration): void {
    const key = `${config.buildType}-${config.platform}`;
    this.configurations.set(key, {
      ...config,
      timestamp: new Date()
    });
  }

  /**
   * Create build parameters object for injection into nested builds
   */
  createBuildParametersObject(buildType: string, platform: string): Record<string, any> {
    const config = this.getBuildConfiguration(buildType, platform);
    const params: Record<string, any> = {};

    // Add global parameters
    const globalParams = this.getBuildParametersForScope('global');
    globalParams.forEach((value, key) => {
      params[key] = value;
    });

    // Add platform-specific parameters
    const platformParams = this.getBuildParametersForScope(platform as any);
    platformParams.forEach((value, key) => {
      params[key] = value;
    });

    // Add configuration parameters
    if (config) {
      config.parameters.forEach(param => {
        if (param.scope === 'global' || param.scope === platform) {
          if (!param.buildType || param.buildType === buildType) {
            params[param.key] = param.value;
          }
        }
      });
    }

    return params;
  }

  /**
   * Validate plugin dependencies for injection
   */
  validatePluginDependencies(plugins: PluginInjectionConfig[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const pluginIds = new Set(plugins.map(p => p.pluginId));

    for (const plugin of plugins) {
      if (plugin.dependencies) {
        for (const depId of plugin.dependencies) {
          if (!pluginIds.has(depId)) {
            errors.push(`Plugin ${plugin.pluginId} requires dependency ${depId} which is not included in build`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Export configuration for external build tools
   */
  exportBuildConfiguration(buildType: string, platform: string): string {
    const config = this.getBuildConfiguration(buildType, platform);
    const plugins = this.getPluginsForInjection(buildType, platform);
    const parameters = this.createBuildParametersObject(buildType, platform);

    const exportData = {
      buildType,
      platform,
      plugins: plugins.map(p => ({
        id: p.pluginId,
        enabled: p.enabled,
        priority: p.priority,
        config: p.config || {}
      })),
      parameters,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Get all available configurations
   */
  getAllConfigurations(): BuildConfiguration[] {
    return Array.from(this.configurations.values());
  }
}

export const buildConfigurationManager = new BuildConfigurationManager();