/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Test for Java GradleBuild plugin injection implementation.
 * Got it, love.
 */

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;
import org.gradle.api.Project;
import org.gradle.testfixtures.ProjectBuilder;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Java GradleBuild implementation with plugin injection support.
 */
class GradleBuildTest {
    
    private Project project;
    private GradleBuild gradleBuild;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        project = ProjectBuilder.builder()
            .withProjectDir(tempDir.toFile())
            .build();
        
        gradleBuild = project.getTasks().create("testGradleBuild", GradleBuild.class);
    }
    
    @Test
    void testPluginInjectionConfiguration() {
        // Test that we can configure plugin injection
        gradleBuild.injectPlugin("com.sallie.test-plugin");
        gradleBuild.injectPlugin("com.sallie.another-plugin", "testConfig { enabled = true }");
        
        assertEquals(2, gradleBuild.getInjectedPlugins().size());
        assertTrue(gradleBuild.getInjectedPlugins().contains("com.sallie.test-plugin"));
        assertTrue(gradleBuild.getInjectedPlugins().contains("com.sallie.another-plugin"));
        
        Map<String, String> configs = gradleBuild.getPluginConfigurations();
        assertEquals("testConfig { enabled = true }", configs.get("com.sallie.another-plugin"));
        assertNull(configs.get("com.sallie.test-plugin"));
    }
    
    @Test
    void testPluginInjectionEnablement() {
        // Test that plugin injection can be enabled/disabled
        assertTrue(gradleBuild.isEnablePluginInjection()); // Default should be true
        
        gradleBuild.setEnablePluginInjection(false);
        assertFalse(gradleBuild.isEnablePluginInjection());
        
        gradleBuild.setEnablePluginInjection(true);
        assertTrue(gradleBuild.isEnablePluginInjection());
    }
    
    @Test
    void testBuildNameConfiguration() {
        // Test build name setting
        gradleBuild.setBuildName("test-build");
        assertEquals("test-build", gradleBuild.getBuildName());
    }
    
    @Test
    void testTaskConfiguration() {
        // Test task configuration
        gradleBuild.setTasks(Arrays.asList("clean", "build", "test"));
        assertEquals(3, gradleBuild.getTasks().size());
        assertTrue(gradleBuild.getTasks().contains("clean"));
        assertTrue(gradleBuild.getTasks().contains("build"));
        assertTrue(gradleBuild.getTasks().contains("test"));
    }
    
    @Test
    void testPluginInjectionExtension() {
        // Test the plugin injection extension
        PluginInjectionExtension extension = new PluginInjectionExtension();
        
        extension.plugin("com.sallie.test");
        extension.plugin("com.sallie.configured", "config { value = 'test' }");
        extension.argument("--debug");
        
        assertEquals(2, extension.getEnabledPlugins().size());
        assertEquals(1, extension.getPluginConfigurations().size());
        assertEquals(1, extension.getDefaultArguments().size());
        
        assertTrue(extension.getEnabledPlugins().contains("com.sallie.test"));
        assertTrue(extension.getEnabledPlugins().contains("com.sallie.configured"));
        assertEquals("config { value = 'test' }", extension.getPluginConfigurations().get("com.sallie.configured"));
        assertEquals("--debug", extension.getDefaultArguments().get(0));
    }
}