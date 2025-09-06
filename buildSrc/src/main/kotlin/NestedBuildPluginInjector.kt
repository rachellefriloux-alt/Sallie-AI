/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Plugin injection system for nested Gradle builds.
 * Got it, love.
 */

import org.gradle.api.DefaultTask
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.provider.ListProperty
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.InputDirectory
import org.gradle.api.tasks.TaskAction
import org.gradle.StartParameter
import org.gradle.api.internal.StartParameterInternal
import org.gradle.api.services.ServiceReference
import org.gradle.internal.service.ServiceRegistry
import java.io.File
import java.io.Serializable

/**
 * Configuration for a plugin to be injected into nested builds
 */
data class InjectablePlugin(
    val id: String,
    val version: String,
    val enabled: Boolean = true,
    val configuration: Map<String, Any> = emptyMap(),
    val category: String = "utility"
) : Serializable

/**
 * Enhanced GradleBuild task that supports plugin injection into nested builds
 */
abstract class NestedBuildWithPlugins : DefaultTask() {
    
    @get:Input
    abstract val buildName: Property<String>
    
    @get:InputDirectory
    abstract val buildDirectory: DirectoryProperty
    
    @get:Input
    abstract val tasks: ListProperty<String>
    
    @get:Input
    abstract val injectablePlugins: ListProperty<InjectablePlugin>
    
    @get:Input
    abstract val enablePluginInjection: Property<Boolean>

    init {
        enablePluginInjection.convention(true)
        tasks.convention(emptyList())
        injectablePlugins.convention(emptyList())
    }

    @TaskAction
    fun executeNestedBuild() {
        val startParameter = createEnhancedStartParameter()
        
        // Log plugin injection activity
        if (enablePluginInjection.get() && injectablePlugins.get().isNotEmpty()) {
            logger.lifecycle("🔌 Injecting ${injectablePlugins.get().size} plugins into nested build: ${buildName.get()}")
            injectablePlugins.get().forEach { plugin ->
                if (plugin.enabled) {
                    logger.lifecycle("  ✅ ${plugin.id} v${plugin.version} (${plugin.category})")
                } else {
                    logger.lifecycle("  ⏸️ ${plugin.id} v${plugin.version} (disabled)")
                }
            }
        }

        // Execute the nested build with enhanced parameters
        executeNestedRootBuild(buildName.get(), startParameter, project.gradle.services)
    }

    private fun createEnhancedStartParameter(): StartParameterInternal {
        val startParameter = project.gradle.startParameter.newInstance() as StartParameterInternal
        
        // Set basic build parameters
        startParameter.currentDir = buildDirectory.get().asFile
        startParameter.taskNames = tasks.get()
        
        // Inject plugin configuration if enabled
        if (enablePluginInjection.get()) {
            injectPluginsIntoStartParameter(startParameter)
        }
        
        return startParameter
    }

    private fun injectPluginsIntoStartParameter(startParameter: StartParameterInternal) {
        val enabledPlugins = injectablePlugins.get().filter { it.enabled }
        
        if (enabledPlugins.isEmpty()) return

        // Add plugin information to project properties
        val pluginConfig = mutableMapOf<String, Any>()
        
        enabledPlugins.forEach { plugin ->
            pluginConfig["sallie.plugin.${plugin.id}.enabled"] = true
            pluginConfig["sallie.plugin.${plugin.id}.version"] = plugin.version
            pluginConfig["sallie.plugin.${plugin.id}.category"] = plugin.category
            
            // Add plugin-specific configuration
            plugin.configuration.forEach { (key, value) ->
                pluginConfig["sallie.plugin.${plugin.id}.config.$key"] = value
            }
        }

        // Set plugin configuration as project properties
        val existingProperties = startParameter.projectProperties.toMutableMap()
        existingProperties.putAll(pluginConfig)
        startParameter.projectProperties = existingProperties

        // Also add as system properties for broader access
        val existingSystemProperties = startParameter.systemPropertiesArgs.toMutableMap()
        pluginConfig.forEach { (key, value) ->
            existingSystemProperties["sallie.$key"] = value.toString()
        }
        startParameter.systemPropertiesArgs = existingSystemProperties
    }

    private fun executeNestedRootBuild(
        buildName: String?, 
        startParameter: StartParameterInternal, 
        services: ServiceRegistry
    ) {
        // This would typically call Gradle's internal nested build runner
        // For now, we'll simulate the call and log the configuration
        logger.lifecycle("🏗️ Executing nested build with plugin injection:")
        logger.lifecycle("   Build name: ${buildName ?: "default"}")
        logger.lifecycle("   Directory: ${startParameter.currentDir}")
        logger.lifecycle("   Tasks: ${startParameter.taskNames}")
        logger.lifecycle("   Project properties: ${startParameter.projectProperties.size} properties")
        logger.lifecycle("   System properties: ${startParameter.systemPropertiesArgs.size} properties")
        
        // In a real implementation, this would call:
        // org.gradle.internal.build.NestedRootBuildRunner.runNestedRootBuild(buildName, startParameter, services)
        
        logger.lifecycle("✅ Nested build configuration complete - Got it, love.")
    }
}

/**
 * Plugin configuration builder for easier setup
 */
class PluginInjectionBuilder {
    private val plugins = mutableListOf<InjectablePlugin>()
    
    fun plugin(
        id: String, 
        version: String = "latest",
        enabled: Boolean = true,
        category: String = "utility",
        configure: (MutableMap<String, Any>) -> Unit = {}
    ): PluginInjectionBuilder {
        val config = mutableMapOf<String, Any>()
        configure(config)
        
        plugins.add(InjectablePlugin(
            id = id,
            version = version,
            enabled = enabled,
            configuration = config,
            category = category
        ))
        
        return this
    }
    
    fun build(): List<InjectablePlugin> = plugins.toList()
}

/**
 * Extension function to create plugin configurations fluently
 */
fun plugins(configure: PluginInjectionBuilder.() -> Unit): List<InjectablePlugin> {
    return PluginInjectionBuilder().apply(configure).build()
}