/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for plugin injection functionality.
 * Got it, love.
 */
import org.gradle.api.Project
import org.gradle.api.Task
import org.gradle.testfixtures.ProjectBuilder
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class PluginInjectingGradleBuildTest {
    
    private lateinit var project: Project
    private lateinit var task: PluginInjectingGradleBuild
    
    @TempDir
    lateinit var tempDir: File
    
    @BeforeEach
    fun setUp() {
        project = ProjectBuilder.builder()
            .withProjectDir(tempDir)
            .build()
        
        task = project.tasks.create("testPluginInject", PluginInjectingGradleBuild::class.java)
    }
    
    @Test
    fun `should create task with default values`() {
        assertEquals("salle-build", task.group)
        assertTrue(task.description.contains("plugin injection"))
        assertTrue(task.enablePluginInjection.get())
        assertEquals(listOf("build"), task.tasks.get())
    }
    
    @Test
    fun `should configure plugin injection via DSL`() {
        // Test the injectPlugin method
        task.injectPlugin("com.example.plugin", "1.0.0", mapOf("key" to "value"))
        
        assertEquals(1, task.parsedPluginConfigs.size)
        val plugin = task.parsedPluginConfigs[0]
        assertEquals("com.example.plugin", plugin.pluginId)
        assertEquals("1.0.0", plugin.version)
        assertTrue(plugin.apply)
        assertEquals(mapOf("key" to "value"), plugin.configuration)
    }
    
    @Test
    fun `should configure multiple plugins`() {
        task.injectPlugin("plugin.one", "1.0")
        task.injectPlugin("plugin.two")
        task.injectPlugin("plugin.three", "2.0", mapOf("config" to "test"))
        
        assertEquals(3, task.parsedPluginConfigs.size)
        assertEquals("plugin.one", task.parsedPluginConfigs[0].pluginId)
        assertEquals("plugin.two", task.parsedPluginConfigs[1].pluginId)
        assertEquals("plugin.three", task.parsedPluginConfigs[2].pluginId)
    }
    
    @Test
    fun `should parse plugin configurations from properties`() {
        // Set plugin configurations via properties
        task.injectedPlugins.set(listOf("kotlin.jvm", "android.application"))
        task.pluginConfigurations.set("detekt:1.23.4;ktlint:12.1.0")
        
        // Use reflection to access private method for testing
        val parseMethod = task.javaClass.getDeclaredMethod("parsePluginConfigurations")
        parseMethod.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val configs = parseMethod.invoke(task) as List<PluginConfiguration>
        
        assertEquals(4, configs.size)
        
        // Check injected plugins
        assertTrue(configs.any { it.pluginId == "kotlin.jvm" })
        assertTrue(configs.any { it.pluginId == "android.application" })
        
        // Check plugin configurations
        assertTrue(configs.any { it.pluginId == "detekt" && it.version == "1.23.4" })
        assertTrue(configs.any { it.pluginId == "ktlint" && it.version == "12.1.0" })
    }
    
    @Test
    fun `should validate plugin configurations`() {
        val validConfig = PluginConfiguration("valid.plugin", "1.0")
        val invalidConfig = PluginConfiguration("", "1.0") // Empty plugin ID
        
        // Use reflection to access private method
        val validateMethod = task.javaClass.getDeclaredMethod("validatePluginConfigurations", List::class.java)
        validateMethod.isAccessible = true
        
        // Valid configuration should not throw
        assertDoesNotThrow {
            validateMethod.invoke(task, listOf(validConfig))
        }
        
        // Invalid configuration should throw
        assertThrows(Exception::class.java) {
            validateMethod.invoke(task, listOf(invalidConfig))
        }
    }
    
    @Test
    fun `should create plugin injection script`() {
        val plugins = listOf(
            PluginConfiguration("kotlin.jvm", "1.9.25"),
            PluginConfiguration("detekt", "1.23.4", configuration = mapOf("config" to "detekt.yml"))
        )
        
        // Use reflection to access private method
        val createScriptMethod = task.javaClass.getDeclaredMethod("createPluginInjectionScript", List::class.java)
        createScriptMethod.isAccessible = true
        val scriptFile = createScriptMethod.invoke(task, plugins) as File
        
        assertTrue(scriptFile.exists())
        val content = scriptFile.readText()
        
        // Check script content
        assertTrue(content.contains("kotlin.jvm"))
        assertTrue(content.contains("detekt"))
        assertTrue(content.contains("1.9.25"))
        assertTrue(content.contains("1.23.4"))
        assertTrue(content.contains("Salle 1.0"))
        assertTrue(content.contains("Got it, love"))
        
        // Check configuration application
        assertTrue(content.contains("project.ext.set('config', 'detekt.yml')"))
    }
    
    @Test
    fun `should set build options correctly`() {
        task.setBuildFileOption("custom.gradle")
        task.setProjectDirOption("/custom/path")
        task.setInjectPluginsOption("plugin1,plugin2,plugin3")
        
        assertEquals("custom.gradle", task.buildFile.get())
        assertEquals("/custom/path", task.projectDir.get())
        assertEquals(listOf("plugin1", "plugin2", "plugin3"), task.injectedPlugins.get())
    }
    
    @Test
    fun `should handle empty plugin list gracefully`() {
        // No plugins configured
        assertTrue(task.injectedPlugins.get().isEmpty())
        assertTrue(task.parsedPluginConfigs.isEmpty())
        
        // Should not throw when no plugins to inject
        assertDoesNotThrow {
            // Access parsePluginConfigurations via reflection
            val parseMethod = task.javaClass.getDeclaredMethod("parsePluginConfigurations")
            parseMethod.isAccessible = true
            @Suppress("UNCHECKED_CAST")
            val configs = parseMethod.invoke(task) as List<PluginConfiguration>
            assertTrue(configs.isEmpty())
        }
    }
}