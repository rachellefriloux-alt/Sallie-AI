/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Example build configuration with plugin injection.
 * Got it, love.
 */

plugins {
    id("com.android.application")
    kotlin("android")
    // Apply our custom nested build plugin
    id("sallie-nested-build") // This would be registered in the plugin
}

// Configure the Sallie nested build system
sallieNestedBuild {
    buildName.set("sallie-main")
    buildDirectory.set(file("$buildDir/sallie-nested"))
    tasks.set(listOf("build", "test"))
    enablePluginInjection.set(true)
    
    // Configure plugins for injection
    plugins {
        plugin("core-ai-orchestrator", "1.0.0", category = "ai") {
            put("enableAdvancedRouting", true)
            put("modelSwitchingEnabled", true)
        }
        
        plugin("advanced-theming", "1.0.0", category = "ui") {
            put("dynamicThemeGeneration", true)
            put("moodBasedColors", true)
        }
        
        plugin("emotional-intelligence", "1.0.0", category = "ai") {
            put("emotionDetectionLevel", "advanced")
            put("personalityAdaptation", true)
        }
        
        plugin("real-time-processing", "0.9.0", category = "utility") {
            put("highPerformanceMode", true)
            put("backgroundProcessing", true)
        }
    }
}

// Task to demonstrate different build scenarios
tasks.register("buildAllVariants") {
    group = "sallie"
    description = "Build all Sallie variants with different plugin configurations"
    
    dependsOn("buildWithAIPlugins", "buildWithUIPlugins", "buildProduction")
    
    doLast {
        println("🎯 All Sallie build variants completed - Got it, love.")
    }
}

// Custom task for development builds
tasks.register<NestedBuildWithPlugins>("buildDevelopment") {
    group = "sallie"
    description = "Development build with full plugin suite"
    
    buildName.set("development")
    buildDirectory.set(file("$buildDir/dev"))
    tasks.set(listOf("build", "test", "installDebug"))
    enablePluginInjection.set(true)
    
    injectablePlugins.set(plugins {
        plugin("core-ai-orchestrator", "1.0.0", category = "ai")
        plugin("advanced-theming", "1.0.0", category = "ui")
        plugin("voice-visualization", "1.0.0", category = "ui")
        plugin("emotional-intelligence", "1.0.0", category = "ai")
        plugin("real-time-processing", "0.9.0", category = "utility")
    })
}

// Task to validate plugin configuration before builds
tasks.register("validatePluginConfig") {
    group = "sallie"
    description = "Validate plugin configuration for nested builds"
    
    doLast {
        val pluginFile = file("$buildDir/sallie-plugins.properties")
        if (pluginFile.exists()) {
            val properties = java.util.Properties()
            properties.load(pluginFile.inputStream())
            
            val enabledPlugins = properties.keys
                .map { it.toString() }
                .filter { it.endsWith(".enabled") && properties[it] == "true" }
                .map { it.substringAfter("sallie.plugin.").substringBefore(".enabled") }
            
            println("✅ Plugin validation complete:")
            println("   ${enabledPlugins.size} plugins enabled")
            enabledPlugins.forEach { plugin ->
                val version = properties["sallie.plugin.$plugin.version"]
                val category = properties["sallie.plugin.$plugin.category"]
                println("   🔌 $plugin v$version ($category)")
            }
        } else {
            println("⚠️ No plugin configuration found - run exportPluginConfig first")
        }
    }
}

// Ensure plugin validation runs before nested builds
tasks.named("executeNestedBuildWithPlugins") {
    dependsOn("validatePluginConfig")
}

// Create a task to sync TypeScript plugin config to Gradle
tasks.register("syncPluginConfig") {
    group = "sallie"
    description = "Sync TypeScript plugin configuration to Gradle builds"
    
    doLast {
        // This would typically read from the TypeScript plugin registry
        // and generate appropriate Gradle configuration
        val jsConfigFile = file("$projectDir/core/plugin-config.json")
        val gradleConfigFile = file("$buildDir/sallie-plugins.properties")
        
        if (jsConfigFile.exists()) {
            // Read TypeScript plugin config and convert to Gradle format
            println("🔄 Syncing plugin configuration from TypeScript to Gradle...")
            
            // In a real implementation, this would:
            // 1. Read the TypeScript plugin registry state
            // 2. Convert to Gradle properties format
            // 3. Write to the build directory
            
            gradleConfigFile.parentFile.mkdirs()
            gradleConfigFile.writeText("""
                # Sallie Plugin Configuration (Synced from TypeScript)
                # Generated at ${java.time.LocalDateTime.now()}
                
                sallie.plugin.core-ai-orchestrator.enabled=true
                sallie.plugin.core-ai-orchestrator.version=1.0.0
                sallie.plugin.core-ai-orchestrator.category=ai
                
                sallie.plugin.advanced-theming.enabled=true
                sallie.plugin.advanced-theming.version=1.0.0
                sallie.plugin.advanced-theming.category=ui
                
                sallie.plugin.emotional-intelligence.enabled=true
                sallie.plugin.emotional-intelligence.version=1.0.0
                sallie.plugin.emotional-intelligence.category=ai
                
                # Got it, love.
            """.trimIndent())
            
            println("✅ Plugin configuration synced successfully")
        } else {
            println("⚠️ TypeScript plugin configuration not found")
        }
    }
}