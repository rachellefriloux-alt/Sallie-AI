/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Custom GradleBuild task that supports injecting specific plugins into nested builds.
 * Got it, love.
 */
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.provider.ListProperty
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.Internal
import org.gradle.api.tasks.Optional
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.options.Option
import java.io.File

/**
 * Configuration for plugins to be injected into nested builds.
 */
data class PluginConfiguration(
    val pluginId: String,
    val version: String? = null,
    val apply: Boolean = true,
    val configuration: Map<String, Any> = emptyMap()
)

/**
 * Enhanced GradleBuild task that supports plugin injection into nested builds.
 * 
 * This task extends the standard build execution to allow specific plugins
 * to be injected into child builds via StartParameter configuration or
 * build script configuration.
 */
abstract class PluginInjectingGradleBuild : DefaultTask() {
    
    @get:Input
    @get:Optional
    abstract val buildFile: Property<String>
    
    @get:Input
    @get:Optional
    abstract val buildName: Property<String>
    
    @get:Input
    @get:Optional
    abstract val projectDir: Property<String>
    
    @get:Input
    abstract val tasks: ListProperty<String>
    
    @get:Input
    abstract val injectedPlugins: ListProperty<String>
    
    @get:Input
    @get:Optional
    abstract val pluginConfigurations: Property<String>
    
    @get:Input
    @get:Optional
    abstract val enablePluginInjection: Property<Boolean>
    
    @get:Internal
    val parsedPluginConfigs: MutableList<PluginConfiguration> = mutableListOf()
    
    init {
        group = "salle-build"
        description = "Executes a nested Gradle build with plugin injection support"
        
        // Default values
        enablePluginInjection.convention(true)
        tasks.convention(listOf("build"))
        injectedPlugins.convention(emptyList())
    }
    
    @Option(option = "build-file", description = "Build file for the nested build")
    fun setBuildFileOption(buildFile: String) {
        this.buildFile.set(buildFile)
    }
    
    @Option(option = "project-dir", description = "Project directory for the nested build")
    fun setProjectDirOption(projectDir: String) {
        this.projectDir.set(projectDir)
    }
    
    @Option(option = "inject-plugins", description = "Comma-separated list of plugin IDs to inject")
    fun setInjectPluginsOption(plugins: String) {
        this.injectedPlugins.set(plugins.split(",").map { it.trim() })
    }
    
    /**
     * Configures plugins to be injected using a DSL-like approach.
     */
    fun injectPlugin(pluginId: String, version: String? = null, configuration: Map<String, Any> = emptyMap()) {
        parsedPluginConfigs.add(PluginConfiguration(pluginId, version, true, configuration))
    }
    
    /**
     * Parses plugin configurations from JSON-like string format.
     */
    private fun parsePluginConfigurations(): List<PluginConfiguration> {
        val configs = mutableListOf<PluginConfiguration>()
        
        // Add parsed configs from property if present
        pluginConfigurations.orNull?.let { configString ->
            // Simple parsing - in real implementation you'd use JSON parser
            configString.split(";").forEach { config ->
                val parts = config.split(":")
                if (parts.size >= 1) {
                    configs.add(PluginConfiguration(
                        pluginId = parts[0].trim(),
                        version = if (parts.size > 1) parts[1].trim() else null
                    ))
                }
            }
        }
        
        // Add configs from injectedPlugins property
        injectedPlugins.get().forEach { pluginId ->
            configs.add(PluginConfiguration(pluginId.trim()))
        }
        
        // Add configs from DSL
        configs.addAll(parsedPluginConfigs)
        
        return configs
    }
    
    /**
     * Creates an initialization script for plugin injection.
     */
    private fun createPluginInjectionScript(plugins: List<PluginConfiguration>): File {
        val tempDir = File(project.buildDir, "tmp/plugin-injection")
        tempDir.mkdirs()
        
        val initScript = File(tempDir, "inject-plugins.gradle")
        val scriptContent = buildString {
            appendLine("// Auto-generated plugin injection script for Salle 1.0")
            appendLine("// Persona: Tough love meets soul care.")
            appendLine()
            
            appendLine("allprojects {")
            appendLine("    afterEvaluate { project ->")
            
            plugins.forEach { plugin ->
                appendLine("        // Injecting plugin: ${plugin.pluginId}")
                if (plugin.version != null) {
                    appendLine("        project.plugins.apply('${plugin.pluginId}')")
                    appendLine("        project.buildscript.dependencies.add('classpath', '${plugin.pluginId}:${plugin.version}')")
                } else {
                    appendLine("        project.plugins.apply('${plugin.pluginId}')")
                }
                
                // Apply any plugin-specific configuration
                if (plugin.configuration.isNotEmpty()) {
                    appendLine("        // Plugin configuration")
                    plugin.configuration.forEach { (key, value) ->
                        appendLine("        project.ext.set('${key}', '${value}')")
                    }
                }
            }
            
            appendLine("    }")
            appendLine("}")
            appendLine()
            appendLine("// Plugin injection completed - Got it, love.")
        }
        
        initScript.writeText(scriptContent)
        logger.info("Created plugin injection script: ${initScript.absolutePath}")
        return initScript
    }
    
    /**
     * Validates the plugin configurations.
     */
    private fun validatePluginConfigurations(plugins: List<PluginConfiguration>) {
        plugins.forEach { plugin ->
            if (plugin.pluginId.isBlank()) {
                throw GradleException("Plugin ID cannot be blank")
            }
            
            // Validate plugin ID format
            if (!plugin.pluginId.matches(Regex("[a-zA-Z0-9._-]+")) ) {
                throw GradleException("Invalid plugin ID format: ${plugin.pluginId}")
            }
        }
    }
    
    @TaskAction
    fun executeBuild() {
        logger.lifecycle("🔧 Starting Salle plugin-injecting build task...")
        
        if (!enablePluginInjection.get()) {
            logger.lifecycle("⚠️ Plugin injection is disabled, running standard build")
            executeStandardBuild()
            return
        }
        
        val plugins = parsePluginConfigurations()
        
        if (plugins.isEmpty()) {
            logger.lifecycle("ℹ️ No plugins to inject, running standard build")
            executeStandardBuild()
            return
        }
        
        logger.lifecycle("🔌 Injecting ${plugins.size} plugin(s) into nested build:")
        plugins.forEach { plugin ->
            logger.lifecycle("   - ${plugin.pluginId}${if (plugin.version != null) ":${plugin.version}" else ""}")
        }
        
        validatePluginConfigurations(plugins)
        
        val initScript = createPluginInjectionScript(plugins)
        
        try {
            executeNestedBuildWithPlugins(initScript)
            logger.lifecycle("✅ Salle plugin injection completed successfully - Got it, love.")
        } catch (e: Exception) {
            logger.error("❌ Plugin injection failed: ${e.message}")
            throw GradleException("Plugin injection failed", e)
        }
    }
    
    /**
     * Executes the nested build with plugin injection.
     */
    private fun executeNestedBuildWithPlugins(initScript: File) {
        val projectDirectory = projectDir.getOrElse(project.projectDir.absolutePath)
        val targetDir = File(projectDirectory)
        
        if (!targetDir.exists()) {
            throw GradleException("Project directory does not exist: $projectDirectory")
        }
        
        val buildArgs = mutableListOf<String>()
        
        // Add init script
        buildArgs.addAll(listOf("--init-script", initScript.absolutePath))
        
        // Add build file if specified
        buildFile.orNull?.let { bf ->
            buildArgs.addAll(listOf("--build-file", bf))
        }
        
        // Add tasks
        buildArgs.addAll(tasks.get())
        
        // Log the command for debugging
        logger.info("Executing: gradle ${buildArgs.joinToString(" ")} in $projectDirectory")
        
        // Execute the gradle command
        val result = project.exec { execSpec ->
            execSpec.workingDir = targetDir
            execSpec.commandLine = listOf("./gradlew") + buildArgs
            execSpec.isIgnoreExitValue = false
        }
        
        if (result.exitValue != 0) {
            throw GradleException("Nested build failed with exit code: ${result.exitValue}")
        }
    }
    
    /**
     * Executes a standard build without plugin injection.
     */
    private fun executeStandardBuild() {
        val projectDirectory = projectDir.getOrElse(project.projectDir.absolutePath)
        val targetDir = File(projectDirectory)
        
        if (!targetDir.exists()) {
            throw GradleException("Project directory does not exist: $projectDirectory")
        }
        
        val buildArgs = mutableListOf<String>()
        
        // Add build file if specified
        buildFile.orNull?.let { bf ->
            buildArgs.addAll(listOf("--build-file", bf))
        }
        
        // Add tasks
        buildArgs.addAll(tasks.get())
        
        project.exec { execSpec ->
            execSpec.workingDir = targetDir
            execSpec.commandLine = listOf("./gradlew") + buildArgs
        }
    }
}