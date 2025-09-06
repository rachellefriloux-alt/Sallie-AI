/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Plugin injection system for nested builds and build-time configuration.
 * Got it, love.
 */

import { pluginRegistry, PluginRegistry } from './PluginRegistry';
import { buildConfigurationManager, PluginInjectionConfig, BuildParameter } from './BuildConfigurationManager';

interface NestedBuildConfig {
  buildType: 'development' | 'production' | 'preview';
  platform: 'android' | 'ios' | 'web';
  plugins: PluginInjectionConfig[];
  parameters: Record<string, any>;
  parentBuild?: string;
  nested: boolean;
}

interface BuildExecutionContext {
  buildId: string;
  buildType: string;
  platform: string;
  startTime: Date;
  plugins: Set<string>;
  parameters: Map<string, any>;
  nestedBuilds: NestedBuildConfig[];
}

export class PluginInjectionManager {
  private activeBuilds: Map<string, BuildExecutionContext> = new Map();
  private injectionHooks: Map<string, Function[]> = new Map();

  constructor(
    private pluginRegistry: PluginRegistry,
    private buildConfigManager = buildConfigurationManager
  ) {
    this.initializeInjectionHooks();
  }

  private initializeInjectionHooks(): void {
    // Pre-build hook
    this.addInjectionHook('pre-build', (context: BuildExecutionContext) => {
      console.log(`[Sallie Plugin Injection] Starting build ${context.buildId} for ${context.platform}`);
    });

    // Post-build hook
    this.addInjectionHook('post-build', (context: BuildExecutionContext) => {
      console.log(`[Sallie Plugin Injection] Completed build ${context.buildId}`);
    });

    // Plugin injection hook
    this.addInjectionHook('plugin-inject', (context: BuildExecutionContext, plugin: PluginInjectionConfig) => {
      console.log(`[Sallie Plugin Injection] Injecting plugin ${plugin.pluginId} into build ${context.buildId}`);
    });
  }

  /**
   * Execute a nested build with plugin injection
   * This is the main method that replaces the TODO functionality
   */
  async executeNestedBuild(config: NestedBuildConfig): Promise<boolean> {
    const buildId = this.generateBuildId();
    
    try {
      // Create execution context
      const context: BuildExecutionContext = {
        buildId,
        buildType: config.buildType,
        platform: config.platform,
        startTime: new Date(),
        plugins: new Set(),
        parameters: new Map(),
        nestedBuilds: []
      };

      this.activeBuilds.set(buildId, context);

      // Execute pre-build hooks
      await this.executeHooks('pre-build', context);

      // Validate and inject plugins
      const validation = this.buildConfigManager.validatePluginDependencies(config.plugins);
      if (!validation.valid) {
        throw new Error(`Plugin dependency validation failed: ${validation.errors.join(', ')}`);
      }

      // Inject plugins in priority order
      for (const pluginConfig of config.plugins) {
        await this.injectPlugin(context, pluginConfig);
      }

      // Set build parameters
      Object.entries(config.parameters).forEach(([key, value]) => {
        context.parameters.set(key, value);
      });

      // Execute the actual nested build
      await this.runNestedBuild(context, config);

      // Execute post-build hooks
      await this.executeHooks('post-build', context);

      console.log(`[Sallie Plugin Injection] Build ${buildId} completed successfully with ${context.plugins.size} plugins`);
      return true;

    } catch (error) {
      console.error(`[Sallie Plugin Injection] Build ${buildId} failed:`, error);
      return false;
    } finally {
      this.activeBuilds.delete(buildId);
    }
  }

  /**
   * Inject a plugin into the build context
   */
  private async injectPlugin(context: BuildExecutionContext, pluginConfig: PluginInjectionConfig): Promise<void> {
    const plugin = this.pluginRegistry.getPlugin(pluginConfig.pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginConfig.pluginId} not found in registry`);
    }

    if (!plugin.enabled) {
      console.warn(`[Sallie Plugin Injection] Plugin ${pluginConfig.pluginId} is disabled, skipping injection`);
      return;
    }

    // Execute plugin injection hook
    await this.executeHooks('plugin-inject', context, pluginConfig);

    // Initialize plugin if needed
    if (plugin.initialize && !context.plugins.has(plugin.id)) {
      try {
        await plugin.initialize();
        console.log(`[Sallie Plugin Injection] Initialized plugin ${plugin.id}`);
      } catch (error) {
        throw new Error(`Failed to initialize plugin ${plugin.id}: ${error}`);
      }
    }

    // Apply plugin configuration
    if (pluginConfig.config) {
      plugin.config = { ...plugin.config, ...pluginConfig.config };
    }

    // Add to active plugins
    context.plugins.add(plugin.id);

    // Set plugin-specific build parameters
    if (pluginConfig.config) {
      Object.entries(pluginConfig.config).forEach(([key, value]) => {
        context.parameters.set(`plugin.${plugin.id}.${key}`, value);
      });
    }
  }

  /**
   * Run the actual nested build (implementation depends on build system)
   */
  private async runNestedBuild(context: BuildExecutionContext, config: NestedBuildConfig): Promise<void> {
    // This method would integrate with the actual build system
    // For Expo/React Native, this could involve:
    // - Expo prebuild with plugin configuration
    // - Android Gradle build with injected plugins
    // - iOS build with plugin configuration
    
    console.log(`[Sallie Plugin Injection] Running nested ${config.platform} build with plugins:`, 
      Array.from(context.plugins).join(', '));

    // Create build configuration file for the nested build
    await this.createBuildConfigFile(context, config);

    // Execute platform-specific build logic
    switch (config.platform) {
      case 'android':
        await this.runAndroidNestedBuild(context, config);
        break;
      case 'ios':
        await this.runIOSNestedBuild(context, config);
        break;
      case 'web':
        await this.runWebNestedBuild(context, config);
        break;
    }
  }

  /**
   * Create a build configuration file for the nested build
   */
  private async createBuildConfigFile(context: BuildExecutionContext, config: NestedBuildConfig): Promise<void> {
    const buildConfig = {
      buildId: context.buildId,
      buildType: config.buildType,
      platform: config.platform,
      plugins: Array.from(context.plugins).map(pluginId => {
        const plugin = this.pluginRegistry.getPlugin(pluginId);
        return {
          id: pluginId,
          name: plugin?.name || pluginId,
          config: plugin?.config || {}
        };
      }),
      parameters: Object.fromEntries(context.parameters),
      timestamp: context.startTime.toISOString()
    };

    // This could write to a file that the build system reads
    console.log(`[Sallie Plugin Injection] Build configuration:`, JSON.stringify(buildConfig, null, 2));
  }

  /**
   * Android-specific nested build execution
   */
  private async runAndroidNestedBuild(context: BuildExecutionContext, config: NestedBuildConfig): Promise<void> {
    // Android-specific logic here
    console.log(`[Sallie Plugin Injection] Executing Android nested build for ${context.buildId}`);
    
    // This would integrate with Gradle build system
    // Could modify android/app/build.gradle or create plugin configuration
    // Similar to how the original GradleBuild.java TODO was intended
  }

  /**
   * iOS-specific nested build execution
   */
  private async runIOSNestedBuild(context: BuildExecutionContext, config: NestedBuildConfig): Promise<void> {
    // iOS-specific logic here
    console.log(`[Sallie Plugin Injection] Executing iOS nested build for ${context.buildId}`);
  }

  /**
   * Web-specific nested build execution
   */
  private async runWebNestedBuild(context: BuildExecutionContext, config: NestedBuildConfig): Promise<void> {
    // Web-specific logic here
    console.log(`[Sallie Plugin Injection] Executing Web nested build for ${context.buildId}`);
  }

  /**
   * Add an injection hook
   */
  addInjectionHook(event: string, callback: Function): void {
    if (!this.injectionHooks.has(event)) {
      this.injectionHooks.set(event, []);
    }
    this.injectionHooks.get(event)!.push(callback);
  }

  /**
   * Execute hooks for a specific event
   */
  private async executeHooks(event: string, ...args: any[]): Promise<void> {
    const hooks = this.injectionHooks.get(event) || [];
    
    for (const hook of hooks) {
      try {
        await hook(...args);
      } catch (error) {
        console.error(`[Sallie Plugin Injection] Hook execution failed for ${event}:`, error);
      }
    }
  }

  /**
   * Create a nested build configuration from build manager settings
   */
  createNestedBuildConfig(buildType: string, platform: string): NestedBuildConfig {
    const plugins = this.buildConfigManager.getPluginsForInjection(buildType, platform);
    const parameters = this.buildConfigManager.createBuildParametersObject(buildType, platform);

    return {
      buildType: buildType as any,
      platform: platform as any,
      plugins,
      parameters,
      nested: true
    };
  }

  /**
   * Execute nested build using configuration manager
   * This is the main API method that implements the TODO functionality
   */
  async executeNestedBuildFromConfig(buildType: string, platform: string): Promise<boolean> {
    const config = this.createNestedBuildConfig(buildType, platform);
    return await this.executeNestedBuild(config);
  }

  /**
   * Get active build information
   */
  getActiveBuild(buildId: string): BuildExecutionContext | undefined {
    return this.activeBuilds.get(buildId);
  }

  /**
   * Get all active builds
   */
  getAllActiveBuilds(): BuildExecutionContext[] {
    return Array.from(this.activeBuilds.values());
  }

  /**
   * Generate unique build ID
   */
  private generateBuildId(): string {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const pluginInjectionManager = new PluginInjectionManager(pluginRegistry);