/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Gradle plugin to support nested build plugin injection.
 * Got it, love.
 */

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.TaskProvider

/**
 * Plugin that adds support for injecting Sallie plugins into nested builds
 */
class SallieNestedBuildPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        // Register the plugin injection task
        val nestedBuildTask = project.tasks.register(
            "executeNestedBuildWithPlugins",
            NestedBuildWithPlugins::class.java
        ) { task ->
            task.group = "sallie"
            task.description = "Execute nested Gradle build with Sallie plugin injection"
            
            // Set default values
            task.buildDirectory.convention(project.layout.buildDirectory.dir("nested"))
            task.enablePluginInjection.convention(true)
        }

        // Create extension for easier configuration
        val extension = project.extensions.create("sallieNestedBuild", SallieNestedBuildExtension::class.java)
        
        // Configure task based on extension
        project.afterEvaluate {
            nestedBuildTask.configure { task ->
                if (extension.buildName.isPresent) {
                    task.buildName.set(extension.buildName)
                }
                
                if (extension.buildDirectory.isPresent) {
                    task.buildDirectory.set(extension.buildDirectory)
                }
                
                if (extension.tasks.isPresent) {
                    task.tasks.set(extension.tasks)
                }
                
                if (extension.plugins.isPresent) {
                    task.injectablePlugins.set(extension.plugins)
                }
                
                task.enablePluginInjection.set(extension.enablePluginInjection.getOrElse(true))
            }
        }

        // Add tasks for common scenarios
        project.tasks.register("buildWithAIPlugins", NestedBuildWithPlugins::class.java) { task ->
            task.group = "sallie"
            task.description = "Build with AI-focused plugins injected"
            task.buildName.set("ai-enabled")
            task.buildDirectory.set(project.layout.buildDirectory.dir("ai-build"))
            task.tasks.set(listOf("build"))
            task.injectablePlugins.set(createAIPluginList())
        }

        project.tasks.register("buildWithUIPlugins", NestedBuildWithPlugins::class.java) { task ->
            task.group = "sallie"
            task.description = "Build with UI-focused plugins injected"
            task.buildName.set("ui-enhanced")
            task.buildDirectory.set(project.layout.buildDirectory.dir("ui-build"))
            task.tasks.set(listOf("build"))
            task.injectablePlugins.set(createUIPluginList())
        }

        project.tasks.register("buildProduction", NestedBuildWithPlugins::class.java) { task ->
            task.group = "sallie"
            task.description = "Production build with optimized plugins"
            task.buildName.set("production")
            task.buildDirectory.set(project.layout.buildDirectory.dir("production"))
            task.tasks.set(listOf("build", "bundleRelease"))
            task.injectablePlugins.set(createProductionPluginList())
        }

        // Create a task to export current plugin configuration
        project.tasks.register("exportPluginConfig") { task ->
            task.group = "sallie"
            task.description = "Export current plugin configuration for build injection"
            task.doLast {
                val configFile = project.layout.buildDirectory.file("sallie-plugins.properties").get().asFile
                configFile.parentFile.mkdirs()
                
                val config = generatePluginConfiguration(extension.plugins.getOrElse(emptyList()))
                configFile.writeText(config)
                
                project.logger.lifecycle("📝 Plugin configuration exported to: ${configFile.absolutePath}")
                project.logger.lifecycle("🔌 ${extension.plugins.getOrElse(emptyList()).size} plugins configured")
            }
        }
    }

    private fun createAIPluginList(): List<InjectablePlugin> {
        return listOf(
            InjectablePlugin(
                id = "core-ai-orchestrator",
                version = "1.0.0",
                enabled = true,
                category = "ai"
            ),
            InjectablePlugin(
                id = "emotional-intelligence",
                version = "1.0.0",
                enabled = true,
                category = "ai"
            )
        )
    }

    private fun createUIPluginList(): List<InjectablePlugin> {
        return listOf(
            InjectablePlugin(
                id = "advanced-theming",
                version = "1.0.0",
                enabled = true,
                category = "ui"
            ),
            InjectablePlugin(
                id = "voice-visualization",
                version = "1.0.0",
                enabled = true,
                category = "ui"
            )
        )
    }

    private fun createProductionPluginList(): List<InjectablePlugin> {
        return listOf(
            InjectablePlugin(
                id = "real-time-processing",
                version = "0.9.0",
                enabled = true,
                category = "utility"
            )
        )
    }

    private fun generatePluginConfiguration(plugins: List<InjectablePlugin>): String {
        val lines = mutableListOf<String>()
        lines.add("# Sallie Plugin Configuration")
        lines.add("# Generated for nested build injection")
        lines.add("# Got it, love.")
        lines.add("")
        
        plugins.filter { it.enabled }.forEach { plugin ->
            lines.add("# Plugin: ${plugin.id} v${plugin.version}")
            lines.add("sallie.plugin.${plugin.id}.enabled=true")
            lines.add("sallie.plugin.${plugin.id}.version=${plugin.version}")
            lines.add("sallie.plugin.${plugin.id}.category=${plugin.category}")
            
            plugin.configuration.forEach { (key, value) ->
                lines.add("sallie.plugin.${plugin.id}.config.$key=$value")
            }
            
            lines.add("")
        }
        
        return lines.joinToString("\n")
    }
}

/**
 * Extension for configuring nested builds with plugin injection
 */
open class SallieNestedBuildExtension {
    val buildName = project.objects.property(String::class.java)
    val buildDirectory = project.objects.directoryProperty()
    val tasks = project.objects.listProperty(String::class.java)
    val plugins = project.objects.listProperty(InjectablePlugin::class.java)
    val enablePluginInjection = project.objects.property(Boolean::class.java)
    
    /**
     * Configure plugins using a builder pattern
     */
    fun plugins(action: PluginInjectionBuilder.() -> Unit) {
        val builder = PluginInjectionBuilder()
        action(builder)
        plugins.set(builder.build())
    }
}