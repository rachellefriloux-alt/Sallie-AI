/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Java implementation of plugin injection extension for nested builds.
 * Got it, love.
 */

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Configuration extension for plugin injection in nested builds.
 * This class provides a Java-based DSL for configuring plugins to inject
 * into nested Gradle builds.
 */
public class PluginInjectionExtension {
    private List<String> enabledPlugins = new ArrayList<>();
    private Map<String, String> pluginConfigurations = new HashMap<>();
    private List<String> defaultArguments = new ArrayList<>();
    
    /**
     * Adds a plugin to be injected into nested builds.
     * @param pluginId The plugin ID to inject.
     */
    public void plugin(String pluginId) {
        plugin(pluginId, null);
    }
    
    /**
     * Adds a plugin with configuration to be injected into nested builds.
     * @param pluginId The plugin ID to inject.
     * @param configuration The configuration script for the plugin (may be null).
     */
    public void plugin(String pluginId, String configuration) {
        enabledPlugins.add(pluginId);
        if (configuration != null && !configuration.trim().isEmpty()) {
            pluginConfigurations.put(pluginId, configuration);
        }
    }
    
    /**
     * Adds a default argument to be passed to nested builds.
     * @param arg The argument to add.
     */
    public void argument(String arg) {
        defaultArguments.add(arg);
    }
    
    /**
     * Returns the list of enabled plugins.
     * @return The enabled plugins list.
     */
    public List<String> getEnabledPlugins() {
        return new ArrayList<>(enabledPlugins);
    }
    
    /**
     * Returns the plugin configurations.
     * @return The plugin configurations map.
     */
    public Map<String, String> getPluginConfigurations() {
        return new HashMap<>(pluginConfigurations);
    }
    
    /**
     * Returns the default arguments.
     * @return The default arguments list.
     */
    public List<String> getDefaultArguments() {
        return new ArrayList<>(defaultArguments);
    }
    
    /**
     * Sets the enabled plugins.
     * @param plugins The plugins to enable.
     */
    public void setEnabledPlugins(List<String> plugins) {
        this.enabledPlugins = new ArrayList<>(plugins);
    }
    
    /**
     * Sets the plugin configurations.
     * @param configurations The plugin configurations.
     */
    public void setPluginConfigurations(Map<String, String> configurations) {
        this.pluginConfigurations = new HashMap<>(configurations);
    }
    
    /**
     * Sets the default arguments.
     * @param arguments The default arguments.
     */
    public void setDefaultArguments(List<String> arguments) {
        this.defaultArguments = new ArrayList<>(arguments);
    }
}