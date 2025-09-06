/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Plugin registry system for extensible capabilities.
 * Got it, love.
 */

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'ai' | 'ui' | 'integration' | 'utility' | 'experimental';
  enabled: boolean;
  dependencies?: string[];
  permissions?: string[];
  config?: Record<string, any>;
  health: 'healthy' | 'warning' | 'error' | 'disabled';
  lastUpdated: Date;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

interface PluginMetrics {
  totalPlugins: number;
  enabledPlugins: number;
  healthyPlugins: number;
  warningPlugins: number;
  errorPlugins: number;
  categoryCounts: Record<string, number>;
}

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private initialized: Set<string> = new Set();
  private hooks: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeBuiltinPlugins();
  }

  private initializeBuiltinPlugins(): void {
    const builtinPlugins: Plugin[] = [
      {
        id: 'core-ai-orchestrator',
        name: 'AI Orchestrator',
        version: '1.0.0',
        description: 'Core AI model routing and orchestration',
        author: 'Sallie Core Team',
        category: 'ai',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        permissions: ['ai-access', 'model-switching']
      },
      {
        id: 'advanced-theming',
        name: 'Advanced Theming Engine',
        version: '1.0.0',
        description: 'Dynamic theming with mood-based color generation',
        author: 'Sallie UI Team',
        category: 'ui',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date()
      },
      {
        id: 'voice-visualization',
        name: 'Voice Visualization',
        version: '1.0.0',
        description: 'Advanced voice waveform and spectrum visualization',
        author: 'Sallie Audio Team',
        category: 'ui',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        dependencies: ['audio-processing']
      },
      {
        id: 'emotional-intelligence',
        name: 'Emotional Intelligence Engine',
        version: '1.0.0',
        description: 'Advanced emotion detection and response adaptation',
        author: 'Sallie AI Team',
        category: 'ai',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        permissions: ['emotion-analysis', 'personality-adaptation']
      },
      {
        id: 'predictive-analytics',
        name: 'Predictive Analytics',
        version: '0.8.0',
        description: 'Machine learning-based user behavior prediction',
        author: 'Sallie Research Team',
        category: 'experimental',
        enabled: false,
        health: 'warning',
        lastUpdated: new Date(),
        permissions: ['data-analysis', 'pattern-recognition']
      },
      {
        id: 'real-time-processing',
        name: 'Real-time Processing Engine',
        version: '0.9.0',
        description: 'High-performance real-time data processing',
        author: 'Sallie Performance Team',
        category: 'utility',
        enabled: true,
        health: 'healthy',
        lastUpdated: new Date(),
        permissions: ['system-access', 'background-processing']
      }
    ];

    builtinPlugins.forEach(plugin => {
      this.plugins.set(plugin.id, plugin);
    });
  }

  async registerPlugin(plugin: Plugin): Promise<boolean> {
    try {
      // Validate plugin
      if (!this.validatePlugin(plugin)) {
        throw new Error(`Invalid plugin configuration: ${plugin.id}`);
      }

      // Check dependencies
      if (!this.checkDependencies(plugin)) {
        throw new Error(`Missing dependencies for plugin: ${plugin.id}`);
      }

      // Register plugin
      this.plugins.set(plugin.id, {
        ...plugin,
        health: 'healthy',
        lastUpdated: new Date()
      });

      // Initialize if enabled
      if (plugin.enabled) {
        await this.initializePlugin(plugin.id);
      }

      this.notifyPluginChange('registered', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error);
      return false;
    }
  }

  async enablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      console.error(`Plugin not found: ${id}`);
      return false;
    }

    try {
      plugin.enabled = true;
      plugin.lastUpdated = new Date();
      
      await this.initializePlugin(id);
      this.notifyPluginChange('enabled', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to enable plugin ${id}:`, error);
      plugin.health = 'error';
      return false;
    }
  }

  async disablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      console.error(`Plugin not found: ${id}`);
      return false;
    }

    try {
      plugin.enabled = false;
      plugin.health = 'disabled';
      plugin.lastUpdated = new Date();
      
      await this.cleanupPlugin(id);
      this.notifyPluginChange('disabled', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to disable plugin ${id}:`, error);
      return false;
    }
  }

  private async initializePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || this.initialized.has(id)) return;

    try {
      if (plugin.initialize) {
        await plugin.initialize();
      }
      
      this.initialized.add(id);
      plugin.health = 'healthy';
    } catch (error) {
      plugin.health = 'error';
      console.error(`Plugin initialization failed for ${id}:`, error);
      throw error;
    }
  }

  private async cleanupPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || !this.initialized.has(id)) return;

    try {
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
      
      this.initialized.delete(id);
    } catch (error) {
      console.error(`Plugin cleanup failed for ${id}:`, error);
    }
  }

  private validatePlugin(plugin: Plugin): boolean {
    return !!(
      plugin.id &&
      plugin.name &&
      plugin.version &&
      plugin.description &&
      plugin.author &&
      plugin.category
    );
  }

  private checkDependencies(plugin: Plugin): boolean {
    if (!plugin.dependencies) return true;
    
    return plugin.dependencies.every(depId => {
      const dependency = this.plugins.get(depId);
      return dependency && dependency.enabled && dependency.health === 'healthy';
    });
  }

  private notifyPluginChange(action: string, plugin: Plugin): void {
    const hooks = this.hooks.get('plugin-change') || [];
    hooks.forEach(hook => {
      try {
        hook({ action, plugin });
      } catch (error) {
        console.error('Plugin hook error:', error);
      }
    });

    // Emit event if in browser
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sallie-plugin-change', {
        detail: { action, plugin }
      });
      window.dispatchEvent(event);
    }
  }

  getPlugin(id: string): Plugin | null {
    return this.plugins.get(id) || null;
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(plugin => plugin.enabled);
  }

  getPluginsByCategory(category: Plugin['category']): Plugin[] {
    return this.getAllPlugins().filter(plugin => plugin.category === category);
  }

  getPluginMetrics(): PluginMetrics {
    const plugins = this.getAllPlugins();
    const categoryCounts: Record<string, number> = {};
    
    plugins.forEach(plugin => {
      categoryCounts[plugin.category] = (categoryCounts[plugin.category] || 0) + 1;
    });

    return {
      totalPlugins: plugins.length,
      enabledPlugins: plugins.filter(p => p.enabled).length,
      healthyPlugins: plugins.filter(p => p.health === 'healthy').length,
      warningPlugins: plugins.filter(p => p.health === 'warning').length,
      errorPlugins: plugins.filter(p => p.health === 'error').length,
      categoryCounts
    };
  }

  async runHealthCheck(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled) continue;

      try {
        // Check if dependencies are still healthy
        if (!this.checkDependencies(plugin)) {
          plugin.health = 'warning';
          continue;
        }

        // Comprehensive health validation
        const healthResult = await this.performComprehensiveHealthCheck(plugin);
        plugin.health = healthResult;
      } catch (error) {
        plugin.health = 'error';
        console.error(`Health check failed for ${plugin.id}:`, error);
      }
    }
  }

  private async performComprehensiveHealthCheck(plugin: Plugin): Promise<Plugin['health']> {
    const checks: Array<{ name: string; result: boolean; severity: 'warning' | 'error' }> = [];

    // 1. Initialization status check
    if (plugin.initialize && !this.initialized.has(plugin.id)) {
      checks.push({ name: 'initialization', result: false, severity: 'error' });
    }

    // 2. Configuration validation
    if (plugin.config) {
      const configValid = this.validatePluginConfiguration(plugin);
      if (!configValid) {
        checks.push({ name: 'configuration', result: false, severity: 'warning' });
      }
    }

    // 3. Permission validation
    if (plugin.permissions && plugin.permissions.length > 0) {
      const permissionsValid = this.validatePluginPermissions(plugin);
      if (!permissionsValid) {
        checks.push({ name: 'permissions', result: false, severity: 'error' });
      }
    }

    // 4. Category-specific health checks
    const categoryHealthy = await this.performCategorySpecificCheck(plugin);
    if (!categoryHealthy) {
      checks.push({ name: 'category-specific', result: false, severity: 'warning' });
    }

    // 5. Version compatibility check
    const versionCompatible = this.checkVersionCompatibility(plugin);
    if (!versionCompatible) {
      checks.push({ name: 'version-compatibility', result: false, severity: 'warning' });
    }

    // 6. Last updated freshness check
    const isFresh = this.checkPluginFreshness(plugin);
    if (!isFresh) {
      checks.push({ name: 'freshness', result: false, severity: 'warning' });
    }

    // Determine overall health based on checks
    const errorChecks = checks.filter(c => c.severity === 'error');
    const warningChecks = checks.filter(c => c.severity === 'warning');

    if (errorChecks.length > 0) {
      return 'error';
    } else if (warningChecks.length > 0) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  private validatePluginConfiguration(plugin: Plugin): boolean {
    if (!plugin.config) return true;
    
    // Check for required configuration keys based on category
    const requiredConfigKeys: Record<string, string[]> = {
      'ai': ['model', 'apiEndpoint'],
      'integration': ['endpoint', 'apiKey'],
      'ui': ['theme', 'layout'],
      'utility': [],
      'experimental': []
    };

    const required = requiredConfigKeys[plugin.category] || [];
    return required.every(key => plugin.config && plugin.config[key] !== undefined);
  }

  private validatePluginPermissions(plugin: Plugin): boolean {
    if (!plugin.permissions) return true;

    // Define valid permissions for each category
    const validPermissions: Record<string, string[]> = {
      'ai': ['ai-access', 'model-switching', 'data-analysis', 'pattern-recognition', 'emotion-analysis', 'personality-adaptation'],
      'ui': ['theme-control', 'ui-rendering', 'user-interaction'],
      'integration': ['api-access', 'external-services', 'network-access'],
      'utility': ['system-access', 'background-processing', 'file-access'],
      'experimental': ['experimental-features', 'beta-access']
    };

    const categoryPermissions = validPermissions[plugin.category] || [];
    const allValidPermissions = Object.values(validPermissions).flat();
    
    return plugin.permissions.every(permission => 
      categoryPermissions.includes(permission) || allValidPermissions.includes(permission)
    );
  }

  private async performCategorySpecificCheck(plugin: Plugin): Promise<boolean> {
    switch (plugin.category) {
      case 'ai':
        // Check if AI models/endpoints are accessible
        return this.checkAIPluginHealth(plugin);
      case 'integration':
        // Check if external services are reachable
        return this.checkIntegrationPluginHealth(plugin);
      case 'ui':
        // Check if UI components can render
        return this.checkUIPluginHealth(plugin);
      case 'utility':
        // Check if system resources are available
        return this.checkUtilityPluginHealth(plugin);
      case 'experimental':
        // More lenient checks for experimental plugins
        return this.checkExperimentalPluginHealth(plugin);
      default:
        return true;
    }
  }

  private checkAIPluginHealth(plugin: Plugin): boolean {
    // Check AI-specific requirements
    if (plugin.config?.model && typeof plugin.config.model !== 'string') {
      return false;
    }
    if (plugin.config?.apiEndpoint && !this.isValidUrl(plugin.config.apiEndpoint)) {
      return false;
    }
    return true;
  }

  private checkIntegrationPluginHealth(plugin: Plugin): boolean {
    // Check integration-specific requirements
    if (plugin.config?.endpoint && !this.isValidUrl(plugin.config.endpoint)) {
      return false;
    }
    if (plugin.config?.apiKey && typeof plugin.config.apiKey !== 'string') {
      return false;
    }
    return true;
  }

  private checkUIPluginHealth(plugin: Plugin): boolean {
    // Check UI-specific requirements
    if (plugin.config?.theme && !['light', 'dark', 'auto'].includes(plugin.config.theme)) {
      return false;
    }
    return true;
  }

  private checkUtilityPluginHealth(plugin: Plugin): boolean {
    // Check utility-specific requirements
    return true; // Utilities are generally more robust
  }

  private checkExperimentalPluginHealth(plugin: Plugin): boolean {
    // Experimental plugins get more lenient checking
    return true;
  }

  private checkVersionCompatibility(plugin: Plugin): boolean {
    // Simple semantic version check - could be enhanced
    const version = plugin.version;
    if (!version) return false;
    
    // Check if version follows semantic versioning pattern
    const semverPattern = /^\d+\.\d+\.\d+(-[\w.-]+)?$/;
    return semverPattern.test(version);
  }

  private checkPluginFreshness(plugin: Plugin): boolean {
    if (!plugin.lastUpdated) return false;
    
    const now = new Date();
    const lastUpdated = new Date(plugin.lastUpdated);
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    // Warn if plugin hasn't been updated in over 90 days
    return daysSinceUpdate <= 90;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  onPluginChange(callback: Function): void {
    if (!this.hooks.has('plugin-change')) {
      this.hooks.set('plugin-change', []);
    }
    this.hooks.get('plugin-change')!.push(callback);
  }

  exportConfiguration(): string {
    const config = {
      plugins: Array.from(this.plugins.values()).map(plugin => ({
        id: plugin.id,
        enabled: plugin.enabled,
        config: plugin.config || {}
      })),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(config, null, 2);
  }

  async importConfiguration(configJson: string): Promise<boolean> {
    try {
      const config = JSON.parse(configJson);
      
      for (const pluginConfig of config.plugins) {
        const plugin = this.plugins.get(pluginConfig.id);
        if (plugin) {
          plugin.enabled = pluginConfig.enabled;
          plugin.config = { ...plugin.config, ...pluginConfig.config };
          
          if (plugin.enabled) {
            await this.initializePlugin(plugin.id);
          } else {
            await this.cleanupPlugin(plugin.id);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import plugin configuration:', error);
      return false;
    }
  }
}

export const pluginRegistry = new PluginRegistry();

export { PluginRegistry, type Plugin, type PluginMetrics };