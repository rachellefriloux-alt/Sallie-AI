/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Tests for plugin injection DSL extensions.
 * Got it, love.
 */
import org.gradle.api.Project
import org.gradle.testfixtures.ProjectBuilder
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class PluginInjectionExtensionsTest {
    
    private lateinit var project: Project
    
    @TempDir
    lateinit var tempDir: File
    
    @BeforeEach
    fun setUp() {
        project = ProjectBuilder.builder()
            .withProjectDir(tempDir)
            .build()
    }
    
    @Test
    fun `should create plugin injection extension`() {
        val extension = PluginInjectionExtension()
        
        extension.plugin("test.plugin", "1.0.0")
        extension.plugin("another.plugin")
        
        assertEquals(2, extension.plugins.size)
        assertEquals("test.plugin", extension.plugins[0].pluginId)
        assertEquals("1.0.0", extension.plugins[0].version)
        assertEquals("another.plugin", extension.plugins[1].pluginId)
        assertNull(extension.plugins[1].version)
    }
    
    @Test
    fun `should configure plugin with configuration block`() {
        val extension = PluginInjectionExtension()
        
        extension.plugin("configured.plugin", "2.0.0") {
            put("key1", "value1")
            put("key2", 42)
            put("key3", true)
        }
        
        assertEquals(1, extension.plugins.size)
        val plugin = extension.plugins[0]
        assertEquals("configured.plugin", plugin.pluginId)
        assertEquals("2.0.0", plugin.version)
        assertEquals("value1", plugin.configuration["key1"])
        assertEquals(42, plugin.configuration["key2"])
        assertEquals(true, plugin.configuration["key3"])
    }
    
    @Test
    fun `should add salle verification plugins`() {
        val extension = PluginInjectionExtension()
        extension.salleVerificationPlugins()
        
        assertEquals(2, extension.plugins.size)
        assertTrue(extension.plugins.any { it.pluginId == "org.jetbrains.kotlin.jvm" })
        assertTrue(extension.plugins.any { it.pluginId == "org.jetbrains.kotlin.android" })
    }
    
    @Test
    fun `should add android build plugins`() {
        val extension = PluginInjectionExtension()
        extension.androidBuildPlugins()
        
        assertEquals(2, extension.plugins.size)
        assertTrue(extension.plugins.any { it.pluginId == "com.android.application" })
        assertTrue(extension.plugins.any { it.pluginId == "com.android.library" })
    }
    
    @Test
    fun `should add quality plugins with versions`() {
        val extension = PluginInjectionExtension()
        extension.qualityPlugins()
        
        assertEquals(2, extension.plugins.size)
        
        val ktlintPlugin = extension.plugins.find { it.pluginId == "org.jlleitschuh.gradle.ktlint" }
        assertNotNull(ktlintPlugin)
        assertEquals("12.1.0", ktlintPlugin?.version)
        
        val detektPlugin = extension.plugins.find { it.pluginId == "io.gitlab.arturbosch.detekt" }
        assertNotNull(detektPlugin)
        assertEquals("1.23.4", detektPlugin?.version)
    }
    
    @Test
    fun `should create nested build task via extension function`() {
        val task = project.salleNestedBuild("testNestedBuild") {
            buildName.set("test-build")
            tasks.set(listOf("clean", "build"))
        }
        
        assertNotNull(task)
        assertTrue(task is PluginInjectingGradleBuild)
        assertEquals("testNestedBuild", task.name)
        
        val pluginTask = task as PluginInjectingGradleBuild
        assertEquals("test-build", pluginTask.buildName.get())
        assertEquals(listOf("clean", "build"), pluginTask.tasks.get())
    }
    
    @Test
    fun `should configure plugin injection via extension`() {
        val task = project.tasks.create("testTask", PluginInjectingGradleBuild::class.java)
        
        task.pluginInjection {
            plugin("test.plugin", "1.0")
            androidBuildPlugins()
            qualityPlugins()
        }
        
        // Should have 5 plugins: 1 test + 2 android + 2 quality
        assertEquals(5, task.parsedPluginConfigs.size)
        
        assertTrue(task.parsedPluginConfigs.any { it.pluginId == "test.plugin" })
        assertTrue(task.parsedPluginConfigs.any { it.pluginId == "com.android.application" })
        assertTrue(task.parsedPluginConfigs.any { it.pluginId == "com.android.library" })
        assertTrue(task.parsedPluginConfigs.any { it.pluginId == "org.jlleitschuh.gradle.ktlint" })
        assertTrue(task.parsedPluginConfigs.any { it.pluginId == "io.gitlab.arturbosch.detekt" })
    }
}