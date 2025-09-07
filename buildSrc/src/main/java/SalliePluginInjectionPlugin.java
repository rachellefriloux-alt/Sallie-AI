/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main plugin for injecting plugins into nested Gradle builds.
 * Got it, love.
 */

import org.gradle.api.Plugin;
import org.gradle.api.Project;

/**
 * The main Sallie plugin injection plugin that provides the infrastructure
 * for injecting plugins into nested builds via StartParameter or build configuration.
 */
public class SalliePluginInjectionPlugin implements Plugin<Project> {
    
    @Override
    public void apply(Project project) {
        // Register the GradleBuild task type
        project.getExtensions().getExtraProperties().set("GradleBuild", GradleBuild.class);
        
        // Create the plugin injection extension for DSL configuration
        PluginInjectionExtension extension = project.getExtensions().create(
            "sallieBuildInjection", 
            PluginInjectionExtension.class
        );
        
        // Log that the plugin has been applied
        project.getLogger().info("✅ Sallie Plugin Injection system applied - Got it, love.");
    }
}