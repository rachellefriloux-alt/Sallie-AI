<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Plugin registry management panel.
  Got it, love.
-->

<template>
  <div class="plugin-registry-panel sallie-card">
    <div class="panel-header">
      <h3>Plugin Registry</h3>
      <div class="header-actions">
        <span class="health-indicator" :class="overallHealth">{{ overallHealth }}</span>
        <button @click="toggleExpanded" class="expand-btn" :class="{ expanded }">
          {{ expanded ? '−' : '+' }}
        </button>
      </div>
    </div>
    
    <div v-if="expanded" class="panel-content">
      <div class="registry-summary">
        <div class="summary-grid">
          <div class="metric">
            <span class="metric-value">{{ metrics.totalPlugins }}</span>
            <span class="metric-label">Total</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ metrics.enabledPlugins }}</span>
            <span class="metric-label">Enabled</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ metrics.healthyPlugins }}</span>
            <span class="metric-label">Healthy</span>
          </div>
          <div class="metric">
            <span class="metric-value">{{ metrics.errorPlugins }}</span>
            <span class="metric-label">Errors</span>
          </div>
        </div>
      </div>

      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="activeCategory = category"
          class="category-tab"
          :class="{ active: activeCategory === category }"
        >
          {{ capitalize(category) }}
          <span class="tab-count">{{ getPluginsByCategory(category).length }}</span>
        </button>
      </div>

      <div class="plugins-list">
        <div 
          v-for="plugin in getPluginsByCategory(activeCategory)" 
          :key="plugin.id"
          class="plugin-item"
          :class="{ 
            'plugin-enabled': plugin.enabled, 
            'plugin-error': plugin.health === 'error',
            'plugin-warning': plugin.health === 'warning'
          }"
        >
          <div class="plugin-header">
            <div class="plugin-info">
              <div class="plugin-name">
                {{ plugin.name }}
                <span class="plugin-version">v{{ plugin.version }}</span>
              </div>
              <div class="plugin-author">by {{ plugin.author }}</div>
            </div>
            <div class="plugin-controls">
              <div class="health-status" :class="plugin.health" :title="plugin.health">
                <div class="health-dot"></div>
              </div>
              <label class="plugin-toggle">
                <input 
                  type="checkbox" 
                  :checked="plugin.enabled"
                  @change="togglePlugin(plugin.id, $event.target.checked)"
                  :disabled="plugin.health === 'error'"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="plugin-description">
            {{ plugin.description }}
          </div>
          
          <div v-if="plugin.dependencies && plugin.dependencies.length" class="plugin-dependencies">
            <small>Dependencies: {{ plugin.dependencies.join(', ') }}</small>
          </div>
          
          <div v-if="plugin.permissions && plugin.permissions.length" class="plugin-permissions">
            <small>Permissions: {{ plugin.permissions.join(', ') }}</small>
          </div>
          
          <div class="plugin-footer">
            <small class="last-updated">
              Updated: {{ formatDate(plugin.lastUpdated) }}
            </small>
            <div class="plugin-actions">
              <button 
                v-if="plugin.health === 'error'" 
                @click="retryPlugin(plugin.id)"
                class="retry-btn"
                title="Retry initialization"
              >
                ↻
              </button>
              <button 
                @click="showPluginDetails(plugin)"
                class="details-btn"
                title="Show details"
              >
                ⓘ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-actions">
        <button @click="runHealthCheck" class="action-btn health">Health Check</button>
        <button @click="exportConfig" class="action-btn secondary">Export Config</button>
        <button @click="refreshRegistry" class="action-btn primary">Refresh</button>
      </div>
    </div>

    <!-- Plugin Details Modal -->
    <div v-if="selectedPlugin" class="plugin-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ selectedPlugin.name }} Details</h4>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <strong>ID:</strong> {{ selectedPlugin.id }}
          </div>
          <div class="detail-row">
            <strong>Version:</strong> {{ selectedPlugin.version }}
          </div>
          <div class="detail-row">
            <strong>Category:</strong> {{ selectedPlugin.category }}
          </div>
          <div class="detail-row">
            <strong>Health:</strong> 
            <span class="health-badge" :class="selectedPlugin.health">
              {{ selectedPlugin.health }}
            </span>
          </div>
          <div class="detail-row">
            <strong>Description:</strong> {{ selectedPlugin.description }}
          </div>
          <div v-if="selectedPlugin.config" class="detail-row">
            <strong>Configuration:</strong>
            <pre class="config-display">{{ JSON.stringify(selectedPlugin.config, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { pluginRegistry } from '../../core/PluginRegistry';

export default {
  name: 'PluginRegistryPanel',
  data() {
    return {
      expanded: false,
      activeCategory: 'ai',
      plugins: [],
      metrics: {},
      categories: ['ai', 'ui', 'integration', 'utility', 'experimental'],
      selectedPlugin: null,
      refreshInterval: null
    };
  },
  computed: {
    overallHealth() {
      if (this.metrics.errorPlugins > 0) return 'error';
      if (this.metrics.warningPlugins > 0) return 'warning';
      return 'healthy';
    }
  },
  mounted() {
    this.loadRegistry();
    this.setupAutoRefresh();
    this.setupEventListeners();
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    loadRegistry() {
      this.plugins = pluginRegistry.getAllPlugins();
      this.metrics = pluginRegistry.getPluginMetrics();
    },
    
    getPluginsByCategory(category) {
      return this.plugins.filter(plugin => plugin.category === category);
    },
    
    async togglePlugin(id, enabled) {
      try {
        if (enabled) {
          await pluginRegistry.enablePlugin(id);
        } else {
          await pluginRegistry.disablePlugin(id);
        }
        this.loadRegistry();
      } catch (error) {
        console.error(`Failed to toggle plugin ${id}:`, error);
      }
    },
    
    async retryPlugin(id) {
      try {
        await pluginRegistry.disablePlugin(id);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
        await pluginRegistry.enablePlugin(id);
        this.loadRegistry();
      } catch (error) {
        console.error(`Failed to retry plugin ${id}:`, error);
      }
    },
    
    async runHealthCheck() {
      try {
        await pluginRegistry.runHealthCheck();
        this.loadRegistry();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    },
    
    exportConfig() {
      const config = pluginRegistry.exportConfiguration();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sallie-plugins.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    
    refreshRegistry() {
      this.loadRegistry();
    },
    
    showPluginDetails(plugin) {
      this.selectedPlugin = plugin;
    },
    
    closeModal() {
      this.selectedPlugin = null;
    },
    
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    
    setupAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.loadRegistry();
      }, 10000); // Refresh every 10 seconds
    },
    
    setupEventListeners() {
      if (typeof window !== 'undefined') {
        window.addEventListener('sallie-plugin-change', (event) => {
          this.loadRegistry();
        });
      }
    }
  }
};
</script>

<style scoped>
.plugin-registry-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 380px;
  max-height: 650px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.health-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.health-indicator.healthy {
  background: #d1fae5;
  color: #065f46;
}

.health-indicator.warning {
  background: #fef3c7;
  color: #92400e;
}

.health-indicator.error {
  background: #fee2e2;
  color: #991b1b;
}

.expand-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.expand-btn.expanded {
  background: #8b5cf6;
  color: white;
}

.panel-content {
  padding: 16px;
}

.registry-summary {
  margin-bottom: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #8b5cf6;
}

.metric-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.category-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tab:hover {
  color: #8b5cf6;
}

.category-tab.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}

.tab-count {
  background: rgba(139, 92, 246, 0.1);
  padding: 2px 5px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.plugins-list {
  max-height: 350px;
  overflow-y: auto;
}

.plugin-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.plugin-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.plugin-item.plugin-enabled {
  border-color: #10b981;
  background: #f0fdf4;
}

.plugin-item.plugin-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.plugin-item.plugin-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.plugin-info {
  flex: 1;
}

.plugin-name {
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.plugin-version {
  font-size: 11px;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.plugin-author {
  font-size: 12px;
  color: #64748b;
}

.plugin-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.health-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.health-status.healthy .health-dot {
  background: #10b981;
}

.health-status.warning .health-dot {
  background: #f59e0b;
}

.health-status.error .health-dot {
  background: #ef4444;
}

.health-status.disabled .health-dot {
  background: #9ca3af;
}

.health-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: health-pulse 2s infinite;
}

@keyframes health-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.plugin-toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.plugin-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input:checked + .toggle-slider {
  background-color: #8b5cf6;
}

input:disabled + .toggle-slider {
  background-color: #e5e7eb;
  cursor: not-allowed;
}

input:checked + .toggle-slider:before {
  transform: translateX(16px);
}

.plugin-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.4;
}

.plugin-dependencies,
.plugin-permissions {
  font-size: 11px;
  color: #f59e0b;
  margin-bottom: 6px;
}

.plugin-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #9ca3af;
}

.plugin-actions {
  display: flex;
  gap: 6px;
}

.retry-btn,
.details-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover,
.details-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.retry-btn {
  color: #f59e0b;
}

.details-btn {
  color: #8b5cf6;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #8b5cf6;
  color: white;
}

.action-btn.primary:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.action-btn.health {
  background: #10b981;
  color: white;
}

.action-btn.health:hover {
  background: #059669;
}

/* Modal styles */
.plugin-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h4 {
  margin: 0;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
}

.modal-body {
  padding: 20px;
}

.detail-row {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.detail-row strong {
  min-width: 100px;
  color: #475569;
}

.health-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.health-badge.healthy {
  background: #d1fae5;
  color: #065f46;
}

.health-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.health-badge.error {
  background: #fee2e2;
  color: #991b1b;
}

.config-display {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
}

@media (max-width: 480px) {
  .plugin-registry-panel {
    left: 10px;
    bottom: 10px;
    width: calc(100vw - 20px);
    max-width: 380px;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-tabs {
    flex-wrap: wrap;
  }
  
  .category-tab {
    flex: none;
    min-width: calc(50% - 2px);
  }
}
</style>