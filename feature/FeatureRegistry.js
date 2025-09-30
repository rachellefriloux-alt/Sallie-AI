/*
 * Sallie 1.0 Module: FeatureRegistry
 * Persona: Tough love meets soul care.
 * Purpose: Central registry for feature modules and integrations.
 * Privacy: No external network calls; local-only logic
 * Got it, love.
 */

class FeatureRegistry {
  constructor() {
    this.features = new Map();
    this.initialized = false;
  }

  /**
   * Register a new feature module
   */
  register(name, feature) {
    if (!name || !feature) {
      throw new Error('Feature name and module are required');
    }
    this.features.set(name, feature);
  }

  /**
   * Get a registered feature
   */
  get(name) {
    return this.features.get(name);
  }

  /**
   * Check if a feature is registered
   */
  has(name) {
    return this.features.has(name);
  }

  /**
   * Initialize all registered features
   */
  async initialize() {
    if (this.initialized) return;
    
    for (const [name, feature] of this.features) {
      if (typeof feature.initialize === 'function') {
        await feature.initialize();
      }
    }
    this.initialized = true;
  }

  /**
   * Get all registered feature names
   */
  getFeatureNames() {
    return Array.from(this.features.keys());
  }
}

module.exports = FeatureRegistry;