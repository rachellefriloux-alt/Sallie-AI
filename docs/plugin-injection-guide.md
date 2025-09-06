# Plugin Injection for Nested Gradle Builds

*Sallie 1.0 Module - Persona: Tough love meets soul care.*

## Overview

This feature implements support for injecting specific plugins into nested Gradle builds via StartParameter or build configuration. It bridges the existing TypeScript plugin registry with Gradle's build system, enabling dynamic plugin configuration for different build scenarios.

## Problem Solved

The original TODO was: "Implement support for injecting specific plugins into nested builds via StartParameter or build configuration, so that custom plugins can be applied to child builds when executing GradleBuild tasks."

This implementation provides:

1. **Plugin Bridge**: Connects TypeScript plugin registry to Gradle builds
2. **Dynamic Configuration**: Inject plugins based on build type, category, or specific requirements
3. **Build Variants**: Different plugin configurations for development, production, AI-focused, and UI-focused builds
4. **Health Monitoring**: Auto-configure builds based on plugin health status

## Architecture

### Components

1. **NestedBuildPluginInjector.kt**: Core Gradle task for plugin injection
2. **SallieNestedBuildPlugin.kt**: Gradle plugin that provides the extension and tasks
3. **GradleBuildPluginBridge.ts**: TypeScript bridge for plugin configuration
4. **Enhanced PluginRegistry.ts**: Extended with build-time features

### Flow

```
TypeScript Plugin Registry
         ↓
GradleBuildPluginBridge (converts)
         ↓
Gradle StartParameter/Properties
         ↓
NestedBuildWithPlugins Task
         ↓
Nested Build Execution
```

## Usage

### Basic Usage

```kotlin
// Apply the plugin
plugins {
    id("sallie-nested-build")
}

// Configure nested build with plugin injection
sallieNestedBuild {
    buildName.set("my-build")
    buildDirectory.set(file("$buildDir/nested"))
    tasks.set(listOf("build", "test"))
    enablePluginInjection.set(true)
    
    plugins {
        plugin("core-ai-orchestrator", "1.0.0", category = "ai") {
            put("enableAdvancedRouting", true)
        }
        
        plugin("advanced-theming", "1.0.0", category = "ui") {
            put("dynamicThemeGeneration", true)
        }
    }
}
```

### Preset Configurations

```kotlin
// AI-focused build
tasks.named("buildWithAIPlugins") {
    // Automatically includes: core-ai-orchestrator, emotional-intelligence
}

// UI-focused build  
tasks.named("buildWithUIPlugins") {
    // Automatically includes: advanced-theming, voice-visualization
}

// Production build
tasks.named("buildProduction") {
    // Includes only: real-time-processing (optimized)
}
```

### TypeScript Integration

```typescript
import { gradleBuildPluginBridge } from './core/GradleBuildPluginBridge';

// Create build configuration
const config = gradleBuildPluginBridge.createNestedBuildConfig({
    buildName: 'my-build',
    buildDirectory: './build/my-build',
    tasks: ['build'],
    pluginCategories: ['ai', 'ui']
});

// Execute the build
await gradleBuildPluginBridge.executeNestedBuildWithPlugins(config);
```

## Plugin Configuration

### Plugin Properties

Plugins are injected as properties in the nested build:

```properties
# Plugin enablement
sallie.plugin.core-ai-orchestrator.enabled=true
sallie.plugin.core-ai-orchestrator.version=1.0.0
sallie.plugin.core-ai-orchestrator.category=ai

# Plugin configuration
sallie.plugin.core-ai-orchestrator.config.enableAdvancedRouting=true
sallie.plugin.core-ai-orchestrator.config.modelSwitchingEnabled=true
```

### Accessing in Nested Builds

```kotlin
// In nested build.gradle.kts
val aiOrchestratorEnabled = project.findProperty("sallie.plugin.core-ai-orchestrator.enabled") == "true"
val aiConfig = project.properties.filterKeys { it.startsWith("sallie.plugin.core-ai-orchestrator.config.") }

if (aiOrchestratorEnabled) {
    // Configure AI-specific build logic
    println("🤖 AI Orchestrator enabled with config: $aiConfig")
}
```

## Available Tasks

### Core Tasks

- `executeNestedBuildWithPlugins`: Main task for plugin injection
- `buildWithAIPlugins`: Preset AI-focused build
- `buildWithUIPlugins`: Preset UI-focused build  
- `buildProduction`: Preset production build
- `exportPluginConfig`: Export current plugin configuration
- `syncPluginConfig`: Sync TypeScript config to Gradle
- `validatePluginConfig`: Validate plugin configuration

### Custom Tasks

```kotlin
tasks.register<NestedBuildWithPlugins>("myCustomBuild") {
    buildName.set("custom")
    buildDirectory.set(file("$buildDir/custom"))
    enablePluginInjection.set(true)
    
    injectablePlugins.set(plugins {
        plugin("my-plugin", "1.0.0") {
            put("customSetting", "value")
        }
    })
}
```

## Plugin Health Integration

The system automatically monitors plugin health and adjusts build configurations:

```typescript
// Auto-configure based on plugin health
const configs = await gradleBuildPluginBridge.autoConfigureBasedOnPluginHealth();

// Only healthy plugins are included in builds
// Warning plugins are logged but excluded
// Error plugins are excluded and logged as errors
```

## Build Variants

### Development Build
- Includes: All healthy plugins
- Tasks: `build`, `test`, `installDebug`
- Purpose: Full feature development

### Production Build  
- Includes: Only `real-time-processing` for performance
- Tasks: `build`, `bundleRelease`
- Purpose: Optimized production builds

### AI-Enabled Build
- Includes: `core-ai-orchestrator`, `emotional-intelligence`
- Tasks: `build`
- Purpose: AI feature development and testing

### UI-Enhanced Build
- Includes: `advanced-theming`, `voice-visualization`
- Tasks: `build`
- Purpose: UI/UX development and testing

## Error Handling

The system gracefully handles:

- Missing plugin configurations
- Invalid plugin IDs
- Build directory issues
- Network connectivity problems
- Plugin health issues

## Testing

Run the plugin injection tests:

```bash
npm test __tests__/pluginInjection.test.ts
```

Tests cover:
- Plugin conversion from TypeScript to Gradle format
- Build configuration creation
- Gradle task generation
- Integration scenarios
- Error handling

## Best Practices

1. **Plugin Categories**: Use appropriate categories (ai, ui, utility, integration, experimental)
2. **Health Monitoring**: Regularly run health checks before builds
3. **Configuration Sync**: Keep TypeScript and Gradle configs synchronized
4. **Validation**: Always validate plugin configuration before builds
5. **Preset Usage**: Use presets for common scenarios to reduce configuration

## Integration with Sallie Architecture

This feature maintains Sallie 1.0 principles:

- **Modular Design**: Independent, swappable plugin injection
- **Persona Consistency**: "Tough love meets soul care" messaging
- **Privacy Core**: No sensitive data in plugin configurations
- **Feature Auditing**: Works with existing `verifySalleFeatures` system
- **Local-Only Support**: Compatible with encrypted, offline builds

## Future Enhancements

- Plugin dependency resolution for nested builds
- Real-time plugin hot-swapping during builds
- Advanced plugin configuration validation
- Build performance metrics with plugin impact analysis
- Plugin marketplace integration for dynamic plugin discovery

---

*Got it, love.*