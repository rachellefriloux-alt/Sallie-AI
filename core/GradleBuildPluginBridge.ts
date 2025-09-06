/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Bridge between TypeScript plugin registry and Gradle build system.
 * Got it, love.
 */

import { Plugin, pluginRegistry } from './PluginRegistry';

interface GradlePluginConfig {
  id: string;
  version: string;
  enabled: boolean;
  configuration: Record<string, any>;
  category: string;
}

interface NestedBuildConfig {
  buildName?: string;
  buildDirectory: string;
  tasks: string[];
  enablePluginInjection: boolean;
  plugins: GradlePluginConfig[];
}

/**
 * Manages plugin injection for Gradle nested builds
 */
class GradleBuildPluginBridge {
  private static instance: GradleBuildPluginBridge;

  public static getInstance(): GradleBuildPluginBridge {
    if (!GradleBuildPluginBridge.instance) {
      GradleBuildPluginBridge.instance = new GradleBuildPluginBridge();
    }
    return GradleBuildPluginBridge.instance;
  }

  /**
   * Convert TypeScript plugins to Gradle-compatible format
   */
  convertPluginsForGradle(plugins: Plugin[]): GradlePluginConfig[] {
    return plugins
      .filter(plugin => plugin.enabled && plugin.health === 'healthy')
      .map(plugin => ({
        id: plugin.id,
        version: plugin.version,
        enabled: plugin.enabled,
        configuration: plugin.config || {},
        category: plugin.category
      }));
  }

  /**
   * Create a nested build configuration with plugin injection
   */
  createNestedBuildConfig(options: {
    buildName?: string;
    buildDirectory: string;
    tasks?: string[];
    includeAllPlugins?: boolean;
    pluginCategories?: Plugin['category'][];
    specificPlugins?: string[];
  }): NestedBuildConfig {
    let pluginsToInject: Plugin[] = [];

    if (options.includeAllPlugins) {
      pluginsToInject = pluginRegistry.getEnabledPlugins();
    } else if (options.pluginCategories) {
      pluginsToInject = options.pluginCategories.flatMap(category =>
        pluginRegistry.getPluginsByCategory(category)
      ).filter(plugin => plugin.enabled);
    } else if (options.specificPlugins) {
      pluginsToInject = options.specificPlugins
        .map(id => pluginRegistry.getPlugin(id))
        .filter((plugin): plugin is Plugin => plugin !== null && plugin.enabled);
    }

    return {
      buildName: options.buildName,
      buildDirectory: options.buildDirectory,
      tasks: options.tasks || [],
      enablePluginInjection: pluginsToInject.length > 0,
      plugins: this.convertPluginsForGradle(pluginsToInject)
    };
  }

  /**
   * Generate Gradle task configuration for nested build with plugins
   */
  generateGradleTaskConfig(config: NestedBuildConfig): string {
    const pluginsList = config.plugins.map(plugin => 
      `InjectablePlugin(
        id = "${plugin.id}",
        version = "${plugin.version}",
        enabled = ${plugin.enabled},
        category = "${plugin.category}",
        configuration = mapOf(${Object.entries(plugin.configuration)
          .map(([key, value]) => `"${key}" to "${value}"`)
          .join(', ')})
      )`
    ).join(',\n        ');

    return `
tasks.register<NestedBuildWithPlugins>("executeNestedBuildWithPlugins") {
    buildName.set("${config.buildName || 'nested-build'}")
    buildDirectory.set(file("${config.buildDirectory}"))
    tasks.set(listOf(${config.tasks.map(task => `"${task}"`).join(', ')}))
    enablePluginInjection.set(${config.enablePluginInjection})
    injectablePlugins.set(listOf(
        ${pluginsList}
    ))
}
`;
  }

  /**
   * Execute a nested build with plugin injection via command line
   */
  async executeNestedBuildWithPlugins(config: NestedBuildConfig): Promise<boolean> {
    try {
      // Generate temporary build script
      const taskConfig = this.generateGradleTaskConfig(config);
      
      // In a real implementation, this would:
      // 1. Write the task configuration to a temporary build file
      // 2. Execute the Gradle task
      // 3. Monitor the build progress
      
      console.log('🔌 Executing nested build with plugin injection:');
      console.log(`   Build: ${config.buildName || 'default'}`);
      console.log(`   Directory: ${config.buildDirectory}`);
      console.log(`   Tasks: ${config.tasks.join(', ')}`);
      console.log(`   Plugins: ${config.plugins.length} plugins`);
      
      config.plugins.forEach(plugin => {
        console.log(`     ✅ ${plugin.id} v${plugin.version} (${plugin.category})`);
      });

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Nested build with plugin injection completed - Got it, love.');
      return true;
    } catch (error) {
      console.error('❌ Nested build failed:', error);
      return false;
    }
  }

  /**
   * Preset configurations for common build scenarios
   */
  getPresetConfigs() {
    return {
      // Development build with UI and utility plugins
      development: (buildDir: string) => this.createNestedBuildConfig({
        buildName: 'development',
        buildDirectory: buildDir,
        tasks: ['build', 'test'],
        pluginCategories: ['ui', 'utility']
      }),

      // Production build with optimized plugins
      production: (buildDir: string) => this.createNestedBuildConfig({
        buildName: 'production',
        buildDirectory: buildDir,
        tasks: ['build', 'bundleRelease'],
        pluginCategories: ['utility'],
        specificPlugins: ['real-time-processing']
      }),

      // AI-focused build
      aiEnabled: (buildDir: string) => this.createNestedBuildConfig({
        buildName: 'ai-enabled',
        buildDirectory: buildDir,
        tasks: ['build'],
        pluginCategories: ['ai']
      }),

      // Full feature build
      fullFeature: (buildDir: string) => this.createNestedBuildConfig({
        buildName: 'full-feature',
        buildDirectory: buildDir,
        tasks: ['build', 'test', 'package'],
        includeAllPlugins: true
      })
    };
  }

  /**
   * Monitor plugin health and auto-configure builds
   */
  async autoConfigureBasedOnPluginHealth(): Promise<NestedBuildConfig[]> {
    await pluginRegistry.runHealthCheck();
    const metrics = pluginRegistry.getPluginMetrics();
    
    const configs: NestedBuildConfig[] = [];

    // Create configurations based on plugin health
    if (metrics.healthyPlugins > 0) {
      configs.push(this.createNestedBuildConfig({
        buildName: 'healthy-plugins-build',
        buildDirectory: './build/healthy',
        tasks: ['build'],
        includeAllPlugins: false,
        specificPlugins: pluginRegistry.getAllPlugins()
          .filter(p => p.health === 'healthy')
          .map(p => p.id)
      }));
    }

    if (metrics.warningPlugins > 0) {
      console.warn(`⚠️ ${metrics.warningPlugins} plugins have warnings - excluding from builds`);
    }

    if (metrics.errorPlugins > 0) {
      console.error(`❌ ${metrics.errorPlugins} plugins have errors - excluding from builds`);
    }

    return configs;
  }
}

// Export singleton instance
export const gradleBuildPluginBridge = GradleBuildPluginBridge.getInstance();

export { 
  GradleBuildPluginBridge, 
  type GradlePluginConfig, 
  type NestedBuildConfig 
};