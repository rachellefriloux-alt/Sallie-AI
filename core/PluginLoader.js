/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced plugin loader with build-time injection support.
 * Provenance-ID: 897b5518-7968-43c3-9412-c0c3d9da133e
 * Last-Reviewed: 2025-01-10T00:00:00Z
 * Got it, love.
 */

export class PluginLoader {
  constructor() {
    this.plugins = [];
    this.extensions = {};
    this.buildTimePlugins = new Map();
    this.injectionHooks = new Map();
  }

  load(plugin) {
    this.plugins.push(plugin);
    if (plugin.extensions) {
      Object.keys(plugin.extensions).forEach(key => {
        this.extensions[key] = plugin.extensions[key];
      });
    }
    if (typeof plugin.init === 'function') {
      plugin.init();
    }
    
    // Notify injection hooks
    this.notifyHooks('plugin-loaded', plugin);
  }

  /**
   * Load a plugin specifically for build-time injection
   * This supports the TODO functionality for injecting plugins into nested builds
   */
  loadForBuildTime(plugin, buildConfig = {}) {
    const buildKey = `${buildConfig.buildType || 'default'}-${buildConfig.platform || 'all'}`;
    
    if (!this.buildTimePlugins.has(buildKey)) {
      this.buildTimePlugins.set(buildKey, []);
    }
    
    const enhancedPlugin = {
      ...plugin,
      buildConfig,
      loadedAt: new Date(),
      buildTimeOnly: true
    };
    
    this.buildTimePlugins.get(buildKey).push(enhancedPlugin);
    
    console.log(`[PluginLoader] Loaded plugin ${plugin.name} for build-time injection (${buildKey})`);
    this.notifyHooks('build-plugin-loaded', enhancedPlugin);
    
    return enhancedPlugin;
  }

  /**
   * Get plugins for a specific build configuration
   */
  getPluginsForBuild(buildType = 'default', platform = 'all') {
    const buildKey = `${buildType}-${platform}`;
    const specificPlugins = this.buildTimePlugins.get(buildKey) || [];
    const allPlatformPlugins = this.buildTimePlugins.get(`${buildType}-all`) || [];
    
    return [...specificPlugins, ...allPlatformPlugins];
  }

  /**
   * Inject plugins into a nested build context
   * This is the main implementation of the TODO functionality
   */
  injectIntoNestedBuild(buildContext) {
    const { buildType, platform, pluginConfigs = [] } = buildContext;
    const injectedPlugins = [];
    
    console.log(`[PluginLoader] Injecting plugins into nested build: ${buildType}/${platform}`);
    
    // Load build-time plugins
    const buildPlugins = this.getPluginsForBuild(buildType, platform);
    buildPlugins.forEach(plugin => {
      try {
        if (plugin.injectIntoNestedBuild && typeof plugin.injectIntoNestedBuild === 'function') {
          plugin.injectIntoNestedBuild(buildContext);
        }
        injectedPlugins.push(plugin);
        console.log(`[PluginLoader] ✅ Injected plugin: ${plugin.name}`);
      } catch (error) {
        console.error(`[PluginLoader] ❌ Failed to inject plugin ${plugin.name}:`, error);
      }
    });
    
    // Process additional plugin configurations
    pluginConfigs.forEach(config => {
      const plugin = this.plugins.find(p => p.name === config.pluginId || p.id === config.pluginId);
      if (plugin && config.enabled) {
        try {
          // Apply configuration
          if (plugin.configure && typeof plugin.configure === 'function') {
            plugin.configure(config.config || {});
          }
          injectedPlugins.push({ ...plugin, config: config.config });
          console.log(`[PluginLoader] ✅ Configured plugin for injection: ${plugin.name}`);
        } catch (error) {
          console.error(`[PluginLoader] ❌ Failed to configure plugin ${plugin.name}:`, error);
        }
      }
    });
    
    this.notifyHooks('nested-build-injection', { buildContext, injectedPlugins });
    
    return {
      success: true,
      injectedPlugins: injectedPlugins,
      buildContext: {
        ...buildContext,
        injectedAt: new Date(),
        pluginCount: injectedPlugins.length
      }
    };
  }

  getExtension(name) {
    return this.extensions[name];
  }

  unload(pluginName) {
    this.plugins = this.plugins.filter(p => p.name !== pluginName);
    
    // Remove from build-time plugins
    this.buildTimePlugins.forEach((plugins, buildKey) => {
      this.buildTimePlugins.set(buildKey, plugins.filter(p => p.name !== pluginName));
    });
    
    // Remove extensions
    Object.keys(this.extensions).forEach(key => {
      if (this.extensions[key].pluginName === pluginName) {
        delete this.extensions[key];
      }
    });
    
    this.notifyHooks('plugin-unloaded', { pluginName });
  }

  listPlugins() {
    return this.plugins.map(p => p.name);
  }

  /**
   * List build-time plugins
   */
  listBuildTimePlugins() {
    const result = {};
    this.buildTimePlugins.forEach((plugins, buildKey) => {
      result[buildKey] = plugins.map(p => ({
        name: p.name,
        buildConfig: p.buildConfig,
        loadedAt: p.loadedAt
      }));
    });
    return result;
  }

  /**
   * Add injection hook for build events
   */
  addInjectionHook(event, callback) {
    if (!this.injectionHooks.has(event)) {
      this.injectionHooks.set(event, []);
    }
    this.injectionHooks.get(event).push(callback);
  }

  /**
   * Remove injection hook
   */
  removeInjectionHook(event, callback) {
    const hooks = this.injectionHooks.get(event);
    if (hooks) {
      const index = hooks.indexOf(callback);
      if (index > -1) {
        hooks.splice(index, 1);
      }
    }
  }

  /**
   * Notify injection hooks
   */
  notifyHooks(event, data) {
    const hooks = this.injectionHooks.get(event) || [];
    hooks.forEach(hook => {
      try {
        hook(data);
      } catch (error) {
        console.error(`[PluginLoader] Hook error for ${event}:`, error);
      }
    });
  }

  /**
   * Get plugin injection statistics
   */
  getInjectionStats() {
    let totalBuildPlugins = 0;
    this.buildTimePlugins.forEach(plugins => {
      totalBuildPlugins += plugins.length;
    });

    return {
      totalPlugins: this.plugins.length,
      totalBuildTimePlugins: totalBuildPlugins,
      buildConfigurations: this.buildTimePlugins.size,
      hookListeners: Array.from(this.injectionHooks.keys()).reduce((acc, key) => {
        acc[key] = this.injectionHooks.get(key).length;
        return acc;
      }, {})
    };
  }
}
