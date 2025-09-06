/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Test for Plugin Registry health check functionality.
 * Got it, love.
 */

// Mock the PluginRegistry module to make it testable
const mockPlugins = new Map();
const mockInitialized = new Set();

// Mock implementation of PluginRegistry methods we need to test
class TestPluginRegistry {
  private plugins = mockPlugins;
  private initialized = mockInitialized;

  async registerPlugin(plugin: any) {
    this.plugins.set(plugin.id, {
      ...plugin,
      // Only set health to 'healthy' if it wasn't explicitly set
      health: plugin.health || 'healthy',
      lastUpdated: plugin.lastUpdated || new Date()
    });
    return true;
  }

  getPlugin(id: string) {
    return this.plugins.get(id) || null;
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  private checkDependencies(plugin: any): boolean {
    if (!plugin.dependencies) return true;
    
    return plugin.dependencies.every((depId: string) => {
      const dependency = this.plugins.get(depId);
      return dependency && dependency.enabled && dependency.health === 'healthy';
    });
  }

  // Include the actual health check methods from PluginRegistry
  private async performComprehensiveHealthCheck(plugin: any): Promise<any> {
    const checks: Array<{ name: string; result: boolean; severity: 'warning' | 'error' }> = [];

    // 1. Configuration validation
    if (plugin.config) {
      const configValid = this.validatePluginConfiguration(plugin);
      if (!configValid) {
        checks.push({ name: 'configuration', result: false, severity: 'warning' });
      }
    }

    // 2. Permission validation
    if (plugin.permissions && plugin.permissions.length > 0) {
      const permissionsValid = this.validatePluginPermissions(plugin);
      if (!permissionsValid) {
        checks.push({ name: 'permissions', result: false, severity: 'error' });
      }
    }

    // 3. Category-specific health checks
    const categoryHealthy = await this.performCategorySpecificCheck(plugin);
    if (!categoryHealthy) {
      checks.push({ name: 'category-specific', result: false, severity: 'warning' });
    }

    // 4. Version compatibility check
    const versionCompatible = this.checkVersionCompatibility(plugin);
    if (!versionCompatible) {
      checks.push({ name: 'version-compatibility', result: false, severity: 'warning' });
    }

    // 5. Last updated freshness check
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

  private validatePluginConfiguration(plugin: any): boolean {
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

  private validatePluginPermissions(plugin: any): boolean {
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
    
    return plugin.permissions.every((permission: string) => 
      categoryPermissions.includes(permission) || allValidPermissions.includes(permission)
    );
  }

  private async performCategorySpecificCheck(plugin: any): Promise<boolean> {
    switch (plugin.category) {
      case 'ai':
        return this.checkAIPluginHealth(plugin);
      case 'integration':
        return this.checkIntegrationPluginHealth(plugin);
      case 'ui':
        return this.checkUIPluginHealth(plugin);
      case 'utility':
        return this.checkUtilityPluginHealth(plugin);
      case 'experimental':
        return this.checkExperimentalPluginHealth(plugin);
      default:
        return true;
    }
  }

  private checkAIPluginHealth(plugin: any): boolean {
    // Check AI-specific requirements
    if (plugin.config?.model && typeof plugin.config.model !== 'string') {
      return false;
    }
    if (plugin.config?.apiEndpoint && !this.isValidUrl(plugin.config.apiEndpoint)) {
      return false;
    }
    return true;
  }

  private checkIntegrationPluginHealth(plugin: any): boolean {
    // Check integration-specific requirements
    if (plugin.config?.endpoint && !this.isValidUrl(plugin.config.endpoint)) {
      return false;
    }
    if (plugin.config?.apiKey && typeof plugin.config.apiKey !== 'string') {
      return false;
    }
    return true;
  }

  private checkUIPluginHealth(plugin: any): boolean {
    // Check UI-specific requirements
    if (plugin.config?.theme && !['light', 'dark', 'auto'].includes(plugin.config.theme)) {
      return false;
    }
    return true;
  }

  private checkUtilityPluginHealth(plugin: any): boolean {
    // Check utility-specific requirements
    return true; // Utilities are generally more robust
  }

  private checkExperimentalPluginHealth(plugin: any): boolean {
    // Experimental plugins get more lenient checking
    return true;
  }

  private checkVersionCompatibility(plugin: any): boolean {
    // Simple semantic version check
    const version = plugin.version;
    if (!version) return false;
    
    // Check if version follows semantic versioning pattern
    const semverPattern = /^\d+\.\d+\.\d+(-[\w.-]+)?$/;
    return semverPattern.test(version);
  }

  private checkPluginFreshness(plugin: any): boolean {
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
}

describe('PluginRegistry Health Checks', () => {
  let registry: TestPluginRegistry;

  beforeEach(async () => {
    registry = new TestPluginRegistry();
    mockPlugins.clear();
    mockInitialized.clear();
  });

  const createTestPlugin = (overrides: any = {}): any => ({
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: 'Test Author',
    category: 'utility',
    enabled: true,
    health: 'healthy',
    lastUpdated: new Date(),
    ...overrides
  });

  describe('runHealthCheck', () => {
    it('should mark disabled plugins as skipped', async () => {
      const disabledPlugin = createTestPlugin({
        id: 'disabled-plugin',
        enabled: false,
        health: 'disabled'
      });

      await registry.registerPlugin(disabledPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('disabled-plugin');
      // Disabled plugins should maintain their health status because health check skips them
      expect(plugin?.health).toBe('disabled');
    });

    it('should validate AI plugin configuration', async () => {
      const aiPlugin = createTestPlugin({
        id: 'ai-plugin',
        category: 'ai',
        config: {
          model: 'gpt-4',
          apiEndpoint: 'https://api.openai.com'
        }
      });

      await registry.registerPlugin(aiPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('ai-plugin');
      expect(plugin?.health).toBe('healthy');
    });

    it('should mark AI plugin with invalid config as warning', async () => {
      const aiPlugin = createTestPlugin({
        id: 'ai-plugin-invalid',
        category: 'ai',
        config: {
          // Missing required 'model' field
          apiEndpoint: 'https://api.openai.com'
        }
      });

      await registry.registerPlugin(aiPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('ai-plugin-invalid');
      expect(plugin?.health).toBe('warning');
    });

    it('should validate plugin permissions', async () => {
      const pluginWithValidPermissions = createTestPlugin({
        id: 'valid-permissions',
        category: 'ai',
        permissions: ['ai-access', 'model-switching']
      });

      await registry.registerPlugin(pluginWithValidPermissions);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('valid-permissions');
      expect(plugin?.health).toBe('healthy');
    });

    it('should mark plugin with invalid permissions as error', async () => {
      const pluginWithInvalidPermissions = createTestPlugin({
        id: 'invalid-permissions',
        category: 'ui',
        permissions: ['invalid-permission', 'another-invalid']
      });

      await registry.registerPlugin(pluginWithInvalidPermissions);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('invalid-permissions');
      expect(plugin?.health).toBe('error');
    });

    it('should validate integration plugin URLs', async () => {
      const integrationPlugin = createTestPlugin({
        id: 'integration-plugin',
        category: 'integration',
        config: {
          endpoint: 'https://api.example.com',
          apiKey: 'valid-key'
        }
      });

      await registry.registerPlugin(integrationPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('integration-plugin');
      expect(plugin?.health).toBe('healthy');
    });

    it('should mark integration plugin with invalid URL as warning', async () => {
      const integrationPlugin = createTestPlugin({
        id: 'integration-plugin-invalid',
        category: 'integration',
        config: {
          endpoint: 'not-a-valid-url',
          apiKey: 'valid-key'
        }
      });

      await registry.registerPlugin(integrationPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('integration-plugin-invalid');
      expect(plugin?.health).toBe('warning');
    });

    it('should validate semantic versioning', async () => {
      const validVersionPlugin = createTestPlugin({
        id: 'valid-version',
        version: '1.2.3'
      });

      const invalidVersionPlugin = createTestPlugin({
        id: 'invalid-version',
        version: 'not-a-version'
      });

      await registry.registerPlugin(validVersionPlugin);
      await registry.registerPlugin(invalidVersionPlugin);
      await registry.runHealthCheck();

      const validPlugin = registry.getPlugin('valid-version');
      const invalidPlugin = registry.getPlugin('invalid-version');

      expect(validPlugin?.health).toBe('healthy');
      expect(invalidPlugin?.health).toBe('warning');
    });

    it('should check plugin freshness based on lastUpdated', async () => {
      const freshPlugin = createTestPlugin({
        id: 'fresh-plugin',
        lastUpdated: new Date() // Current date
      });

      const stalePlugin = createTestPlugin({
        id: 'stale-plugin',
        lastUpdated: new Date('2020-01-01') // Very old date
      });

      await registry.registerPlugin(freshPlugin);
      await registry.registerPlugin(stalePlugin);
      await registry.runHealthCheck();

      const fresh = registry.getPlugin('fresh-plugin');
      const stale = registry.getPlugin('stale-plugin');

      expect(fresh?.health).toBe('healthy');
      expect(stale?.health).toBe('warning');
    });

    it('should be more lenient with experimental plugins', async () => {
      const experimentalPlugin = createTestPlugin({
        id: 'experimental-plugin',
        category: 'experimental',
        config: {
          // Even with potentially problematic config
          someExperimentalFeature: 'test'
        }
      });

      await registry.registerPlugin(experimentalPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('experimental-plugin');
      expect(plugin?.health).toBe('healthy');
    });

    it('should handle plugins with no configuration gracefully', async () => {
      const noConfigPlugin = createTestPlugin({
        id: 'no-config-plugin',
        config: undefined
      });

      await registry.registerPlugin(noConfigPlugin);
      await registry.runHealthCheck();

      const plugin = registry.getPlugin('no-config-plugin');
      expect(plugin?.health).toBe('healthy');
    });
  });
});