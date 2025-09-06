/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main implementation of plugin injection for nested builds (resolves the TODO).
 * Got it, love.
 */

import { pluginInjectionManager } from './PluginInjectionManager';
import { buildConfigurationManager } from './BuildConfigurationManager';
import { StartParameter, createStartParameterForNestedBuild, globalStartParameter } from './StartParameter';

/**
 * NestedBuildRunner - Main class that implements the TODO functionality
 * This replaces the original Gradle build TODO comment:
 * "TODO: Allow us to inject plugins into nested builds too."
 */
export class NestedBuildRunner {
  
  /**
   * Execute a nested build with plugin injection support
   * This is the main implementation of the TODO requirement
   * 
   * @param buildName Optional name for the nested build
   * @param startParameter StartParameter with injected plugins
   * @param services Build services context (optional)
   */
  static async runNestedRootBuild(
    buildName?: string,
    startParameter?: StartParameter,
    services?: any
  ): Promise<boolean> {
    
    console.log(`[NestedBuildRunner] Starting nested build: ${buildName || 'unnamed'}`);
    
    try {
      // Use provided StartParameter or create a new one
      const params = startParameter || globalStartParameter;
      
      // Set build name if provided
      if (buildName) {
        params.setBuildName(buildName);
      }
      
      // Get build configuration
      const buildType = params.getBuildType();
      const platform = params.getPlatform();
      
      console.log(`[NestedBuildRunner] Build configuration: ${buildType} on ${platform}`);
      console.log(`[NestedBuildRunner] Injected plugins: ${params.getInjectedPlugins().length}`);
      
      // Create nested build configuration
      const nestedConfig = {
        buildType: buildType as any,
        platform: platform as any,
        plugins: params.toPluginInjectionConfigs(),
        parameters: {
          ...params.getBuildProperties(),
          ...params.getGradleParameters(),
          buildName: buildName || `nested-build-${Date.now()}`
        },
        nested: true
      };
      
      // Execute the nested build with plugin injection
      const success = await pluginInjectionManager.executeNestedBuild(nestedConfig);
      
      if (success) {
        console.log(`[NestedBuildRunner] ✅ Nested build completed successfully`);
      } else {
        console.error(`[NestedBuildRunner] ❌ Nested build failed`);
      }
      
      return success;
      
    } catch (error) {
      console.error(`[NestedBuildRunner] Error in nested build execution:`, error);
      return false;
    }
  }
  
  /**
   * Create a StartParameter for a new nested build with automatic plugin injection
   * This implements the StartParameter creation mentioned in the TODO
   */
  static createStartParameterForNewBuild(
    services?: any,
    buildType: 'development' | 'production' | 'preview' = 'development',
    platform: 'android' | 'ios' | 'web' | 'all' = 'all'
  ): StartParameter {
    
    const startParameter = createStartParameterForNestedBuild(buildType, platform);
    
    // Inject plugins based on build configuration
    const plugins = buildConfigurationManager.getPluginsForInjection(buildType, platform);
    
    plugins.forEach(pluginConfig => {
      startParameter.injectPlugin(pluginConfig.pluginId, {
        id: pluginConfig.pluginId,
        enabled: pluginConfig.enabled,
        priority: pluginConfig.priority,
        config: pluginConfig.config
      });
    });
    
    // Add build parameters
    const buildParams = buildConfigurationManager.createBuildParametersObject(buildType, platform);
    Object.entries(buildParams).forEach(([key, value]) => {
      startParameter.setBuildProperty(key, value);
    });
    
    console.log(`[NestedBuildRunner] Created StartParameter with ${plugins.length} plugins for ${buildType}/${platform}`);
    
    return startParameter;
  }
  
  /**
   * Convenience method to run a nested build with automatic configuration
   */
  static async runNestedBuildWithAutoConfig(
    buildName: string,
    buildType: 'development' | 'production' | 'preview' = 'development',
    platform: 'android' | 'ios' | 'web' = 'android'
  ): Promise<boolean> {
    
    const startParameter = this.createStartParameterForNewBuild(null, buildType, platform);
    return await this.runNestedRootBuild(buildName, startParameter);
  }
  
  /**
   * Get information about plugin injection capabilities
   */
  static getPluginInjectionInfo(): {
    availablePlugins: string[];
    buildTypes: string[];
    platforms: string[];
    activeBuilds: number;
  } {
    const plugins = buildConfigurationManager.getAllConfigurations();
    const allPluginIds = new Set<string>();
    
    plugins.forEach(config => {
      config.plugins.forEach(plugin => {
        allPluginIds.add(plugin.pluginId);
      });
    });
    
    return {
      availablePlugins: Array.from(allPluginIds),
      buildTypes: ['development', 'production', 'preview'],
      platforms: ['android', 'ios', 'web'],
      activeBuilds: pluginInjectionManager.getAllActiveBuilds().length
    };
  }
  
  /**
   * Debug method to list current plugin injection configuration
   */
  static debugPluginInjection(): void {
    console.log('\n=== Sallie Plugin Injection Debug ===');
    
    const info = this.getPluginInjectionInfo();
    console.log(`Available plugins: ${info.availablePlugins.join(', ')}`);
    console.log(`Build types: ${info.buildTypes.join(', ')}`);
    console.log(`Platforms: ${info.platforms.join(', ')}`);
    console.log(`Active builds: ${info.activeBuilds}`);
    
    console.log('\nGlobal StartParameter:');
    console.log(globalStartParameter.getSummary());
    
    console.log('\nInjected plugins in global StartParameter:');
    globalStartParameter.getInjectedPlugins().forEach(plugin => {
      console.log(`  - ${plugin.id} (enabled: ${plugin.enabled}, priority: ${plugin.priority})`);
    });
    
    console.log('\nBuild configurations:');
    buildConfigurationManager.getAllConfigurations().forEach(config => {
      console.log(`  - ${config.buildType}/${config.platform}: ${config.plugins.length} plugins`);
    });
    
    console.log('=====================================\n');
  }
}

/**
 * Export the main functions that implement the TODO functionality
 */
export {
  StartParameter,
  createStartParameterForNestedBuild,
  globalStartParameter,
  pluginInjectionManager,
  buildConfigurationManager
};

/**
 * Main API exports for implementing plugin injection in nested builds
 */
export const NestedBuildAPI = {
  /**
   * Run a nested build with plugin injection (main TODO implementation)
   */
  runNestedRootBuild: NestedBuildRunner.runNestedRootBuild,
  
  /**
   * Create StartParameter with plugin injection
   */
  createStartParameterForNewBuild: NestedBuildRunner.createStartParameterForNewBuild,
  
  /**
   * Run nested build with automatic configuration
   */
  runNestedBuildWithAutoConfig: NestedBuildRunner.runNestedBuildWithAutoConfig,
  
  /**
   * Get plugin injection information
   */
  getPluginInjectionInfo: NestedBuildRunner.getPluginInjectionInfo,
  
  /**
   * Debug plugin injection setup
   */
  debugPluginInjection: NestedBuildRunner.debugPluginInjection
};

// Initialize global configuration
console.log('[Sallie Plugin Injection] System initialized');
NestedBuildRunner.debugPluginInjection();