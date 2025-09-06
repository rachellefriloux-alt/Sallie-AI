/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: DSL extensions for plugin injection configuration.
 * Got it, love.
 */
import org.gradle.api.Project
import org.gradle.api.Task
import org.gradle.kotlin.dsl.register

/**
 * DSL for configuring plugin injection in nested builds.
 */
class PluginInjectionExtension {
    internal val plugins = mutableListOf<PluginConfiguration>()
    
    /**
     * Adds a plugin to be injected into nested builds.
     */
    fun plugin(id: String, version: String? = null, configuration: Map<String, Any> = emptyMap()) {
        plugins.add(PluginConfiguration(id, version, true, configuration))
    }
    
    /**
     * Adds a plugin with configuration block.
     */
    fun plugin(id: String, version: String? = null, configure: MutableMap<String, Any>.() -> Unit) {
        val config = mutableMapOf<String, Any>()
        configure(config)
        plugins.add(PluginConfiguration(id, version, true, config))
    }
}

/**
 * Extension function to create a plugin-injecting build task.
 */
fun Project.salleNestedBuild(
    name: String,
    configure: PluginInjectingGradleBuild.() -> Unit = {}
): Task {
    return tasks.register<PluginInjectingGradleBuild>(name) {
        configure()
    }.get()
}

/**
 * Extension function to configure plugin injection.
 */
fun PluginInjectingGradleBuild.pluginInjection(configure: PluginInjectionExtension.() -> Unit) {
    val extension = PluginInjectionExtension()
    configure(extension)
    
    // Add all configured plugins to the task
    extension.plugins.forEach { plugin ->
        this.injectPlugin(plugin.pluginId, plugin.version, plugin.configuration)
    }
}

/**
 * Convenience function for common Salle plugins.
 */
fun PluginInjectionExtension.salleVerificationPlugins() {
    plugin("org.jetbrains.kotlin.jvm")
    plugin("org.jetbrains.kotlin.android")
}

/**
 * Convenience function for Android build plugins.
 */
fun PluginInjectionExtension.androidBuildPlugins() {
    plugin("com.android.application")
    plugin("com.android.library")
}

/**
 * Convenience function for quality plugins.
 */
fun PluginInjectionExtension.qualityPlugins() {
    plugin("org.jlleitschuh.gradle.ktlint", "12.1.0")
    plugin("io.gitlab.arturbosch.detekt", "1.23.4")
}