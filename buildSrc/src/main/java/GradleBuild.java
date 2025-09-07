/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced GradleBuild task with plugin injection support for nested builds.
 * Got it, love.
 */

import org.gradle.StartParameter;
import org.gradle.api.DefaultTask;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.TaskAction;

import java.io.File;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

import static org.gradle.internal.build.NestedRootBuildRunner.runNestedRootBuild;

/**
 * Executes a Gradle build with support for injecting specific plugins into nested builds
 * via StartParameter or build configuration. This enables custom plugins to be applied
 * to child builds when executing GradleBuild tasks.
 */
public abstract class GradleBuild extends DefaultTask {
    private StartParameter startParameter;
    private String buildName;
    private List<String> injectedPlugins = new ArrayList<>();
    private Map<String, String> pluginConfigurations = new HashMap<>();
    private boolean enablePluginInjection = true;

    public GradleBuild() {
        // Initialize with defaults
        setGroup("build");
        setDescription("Executes a nested Gradle build with plugin injection support");
    }

    /**
     * Returns the full set of parameters that will be used to execute the build.
     * @return the parameters. Never returns null.
     */
    @Internal
    public StartParameter getStartParameter() {
        if (startParameter == null) {
            startParameter = getProject().getGradle().getStartParameter();
        }
        return startParameter;
    }

    /**
     * Sets the full set of parameters that will be used to execute the build.
     * @param startParameter the parameters. Should not be null.
     */
    public void setStartParameter(StartParameter startParameter) {
        this.startParameter = startParameter;
    }

    /**
     * Returns the project directory for the build. Defaults to the project directory.
     * @return The project directory. Never returns null.
     */
    @Internal
    public File getDir() {
        return getStartParameter().getCurrentDir();
    }

    /**
     * Sets the project directory for the build.
     * @param dir The project directory. Should not be null.
     * @since 4.0
     */
    public void setDir(File dir) {
        setDir((Object) dir);
    }

    /**
     * Sets the project directory for the build.
     * @param dir The project directory. Should not be null.
     */
    public void setDir(Object dir) {
        getStartParameter().setCurrentDir(getProject().file(dir));
    }

    /**
     * Returns the tasks that should be executed for this build.
     * @return The sequence. May be empty. Never returns null.
     */
    @Internal
    public List<String> getTasks() {
        return getStartParameter().getTaskNames();
    }

    /**
     * Sets the tasks that should be executed for this build.
     * @param tasks The task names. May be empty or null to use the default tasks for the build.
     * @since 4.0
     */
    public void setTasks(List<String> tasks) {
        setTasks((Collection<String>) tasks);
    }

    /**
     * Sets the tasks that should be executed for this build.
     * @param tasks The task names. May be empty or null to use the default tasks for the build.
     */
    public void setTasks(Collection<String> tasks) {
        getStartParameter().setTaskNames(tasks);
    }

    /**
     * The build name to use for the nested build.
     * <p>
     * If no value is specified, the name of the directory of the build will be used.
     * @return the build name to use for the nested build (or null if the default is to be used)
     * @since 6.0
     */
    @Internal
    public String getBuildName() {
        return buildName;
    }

    /**
     * Sets build name to use for the nested build.
     *
     * @param buildName the build name to use for the nested build
     * @since 6.0
     */
    public void setBuildName(String buildName) {
        this.buildName = buildName;
    }

    /**
     * Returns the list of plugins to inject into the nested build.
     * @return The plugins to inject. Never returns null.
     */
    @Internal
    public List<String> getInjectedPlugins() {
        return injectedPlugins;
    }

    /**
     * Sets the plugins to inject into the nested build.
     * @param plugins The plugins to inject. May be empty.
     */
    public void setInjectedPlugins(List<String> plugins) {
        this.injectedPlugins = new ArrayList<>(plugins);
    }

    /**
     * Adds a plugin to inject into the nested build.
     * @param pluginId The plugin ID to inject.
     */
    public void injectPlugin(String pluginId) {
        this.injectedPlugins.add(pluginId);
    }

    /**
     * Adds a plugin with configuration to inject into the nested build.
     * @param pluginId The plugin ID to inject.
     * @param configuration The configuration script for the plugin.
     */
    public void injectPlugin(String pluginId, String configuration) {
        this.injectedPlugins.add(pluginId);
        this.pluginConfigurations.put(pluginId, configuration);
    }

    /**
     * Returns the plugin configurations.
     * @return The plugin configurations map. Never returns null.
     */
    @Internal
    public Map<String, String> getPluginConfigurations() {
        return pluginConfigurations;
    }

    /**
     * Sets plugin configurations.
     * @param configurations The plugin configurations.
     */
    public void setPluginConfigurations(Map<String, String> configurations) {
        this.pluginConfigurations = new HashMap<>(configurations);
    }

    /**
     * Returns whether plugin injection is enabled.
     * @return true if plugin injection is enabled, false otherwise.
     */
    @Internal
    public boolean isEnablePluginInjection() {
        return enablePluginInjection;
    }

    /**
     * Sets whether plugin injection is enabled.
     * @param enabled true to enable plugin injection, false to disable.
     */
    public void setEnablePluginInjection(boolean enabled) {
        this.enablePluginInjection = enabled;
    }

    /**
     * Executes a nested Gradle build using the specified start parameters and build name.
     * Now supports injecting specific plugins into nested builds via StartParameter or build configuration,
     * so that custom plugins can be applied to child builds when executing GradleBuild tasks.
     */
    @TaskAction
    void build() {
        StartParameter startParam = getStartParameter();
        
        // Inject plugins if enabled and plugins are configured
        if (enablePluginInjection && !injectedPlugins.isEmpty()) {
            injectPluginsIntoStartParameter(startParam);
        }
        
        if (startParam instanceof StartParameterInternal) {
            runNestedRootBuild(buildName, (StartParameterInternal) startParam, getServices());
            getLogger().lifecycle("✅ Nested build '{}' completed with plugin injection - Got it, love.", 
                buildName != null ? buildName : "unnamed");
        } else {
            throw new IllegalStateException("StartParameter is not an instance of StartParameterInternal");
        }
    }

    /**
     * Injects plugins into the StartParameter for the nested build.
     * This method modifies the StartParameter to include plugin injection arguments.
     */
    private void injectPluginsIntoStartParameter(StartParameter startParam) {
        // Create a temporary build script that applies the plugins
        File buildDir = startParam.getCurrentDir();
        File injectionScript = new File(buildDir, "sallie-injected-plugins.gradle");
        
        try {
            StringBuilder scriptContent = new StringBuilder();
            scriptContent.append("// Auto-generated plugin injection script for Sallie 1.0\n");
            scriptContent.append("// Persona: Tough love meets soul care.\n\n");
            
            for (String pluginId : injectedPlugins) {
                scriptContent.append("apply plugin: '").append(pluginId).append("'\n");
                
                // Apply configuration if available
                String config = pluginConfigurations.get(pluginId);
                if (config != null && !config.trim().isEmpty()) {
                    scriptContent.append("\n// Configuration for ").append(pluginId).append("\n");
                    scriptContent.append(config).append("\n");
                }
            }
            
            scriptContent.append("\n// Sallie 1.0 plugin injection complete\n");
            
            // Write the injection script
            java.nio.file.Files.write(injectionScript.toPath(), scriptContent.toString().getBytes());
            
            // Add the injection script to the StartParameter arguments
            List<String> args = new ArrayList<>(startParam.getProjectProperties().containsKey("org.gradle.project.buildFile") 
                ? List.of() : startParam.getTaskNames());
            args.add("--init-script");
            args.add(injectionScript.getAbsolutePath());
            
            // Update the StartParameter with the new arguments
            startParam.addInitScript(injectionScript);
            
            getLogger().info("Injected {} plugins into nested build: {}", injectedPlugins.size(), injectedPlugins);
            
            // Schedule cleanup after build completion
            getProject().getGradle().buildFinished(result -> {
                try {
                    if (injectionScript.exists()) {
                        injectionScript.delete();
                        getLogger().debug("Cleaned up plugin injection script: {}", injectionScript.getAbsolutePath());
                    }
                } catch (Exception e) {
                    getLogger().warn("Failed to clean up plugin injection script: {}", e.getMessage());
                }
            });
            
        } catch (Exception e) {
            getLogger().error("Failed to inject plugins into nested build", e);
            throw new RuntimeException("Plugin injection failed: " + e.getMessage(), e);
        }
    }
}