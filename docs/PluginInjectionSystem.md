# Plugin Injection for Nested Gradle Builds

**Salle 1.0 Module**  
**Persona: Tough love meets soul care.**  
**Function: Documentation for plugin injection functionality in nested builds.**  
**Got it, love.**

## Overview

The plugin injection system allows Salle to inject specific plugins into nested Gradle builds via StartParameter configuration or build configuration. This enables custom plugins to be applied to child builds when executing GradleBuild tasks, maintaining modularity while ensuring consistent plugin application across all build components.

## Features

### PluginInjectingGradleBuild Task

A custom Gradle task that extends the standard build execution to support plugin injection:

- **Plugin Configuration**: Supports multiple ways to specify plugins
- **DSL Support**: Provides a clean DSL for plugin configuration  
- **Validation**: Validates plugin configurations before execution
- **Script Generation**: Creates initialization scripts for plugin injection
- **Salle Compliance**: Follows Salle 1.0 architecture principles

### Plugin Configuration Methods

#### 1. Direct API Usage

```gradle
task myNestedBuild(type: PluginInjectingGradleBuild) {
    projectDir = "path/to/nested/project"
    tasks = ["clean", "build"]
    
    // Inject plugins directly
    injectPlugin("org.jetbrains.kotlin.android", "1.9.25")
    injectPlugin("com.android.application")
    injectPlugin("org.jlleitschuh.gradle.ktlint", "12.1.0", [
        "android": "true",
        "outputToConsole": "true"
    ])
}
```

#### 2. Property-Based Configuration

```gradle
task myNestedBuild(type: PluginInjectingGradleBuild) {
    projectDir = "path/to/nested/project"
    tasks = ["build"]
    
    // Plugin list via property
    injectedPlugins = ["kotlin.jvm", "android.application"]
    
    // Plugin configurations with versions
    pluginConfigurations = "detekt:1.23.4;ktlint:12.1.0;dokka:1.9.10"
}
```

#### 3. DSL Configuration

```gradle
task myNestedBuild(type: PluginInjectingGradleBuild) {
    projectDir = "path/to/nested/project"
    tasks = ["assembleDebug"]
    
    pluginInjection {
        // Standard plugin sets
        androidBuildPlugins()
        salleVerificationPlugins()
        qualityPlugins()
        
        // Custom plugin with configuration
        plugin("com.google.gms.google-services", "4.4.2") {
            put("enableCrashlytics", "true")
            put("enableAnalytics", "true")
        }
    }
}
```

### Command Line Usage

```bash
# Inject plugins via command line
./gradlew myNestedBuild --inject-plugins="kotlin.android,detekt,ktlint"

# Specify project directory
./gradlew myNestedBuild --project-dir="/path/to/nested" --build-file="custom.gradle"
```

## DSL Extensions

### Convenience Methods

- `androidBuildPlugins()`: Adds Android application and library plugins
- `salleVerificationPlugins()`: Adds Kotlin JVM and Android plugins
- `qualityPlugins()`: Adds KtLint and Detekt with standard versions

### Project Extension

```gradle
// Create nested build tasks easily
salleNestedBuild("buildFeatureModule") {
    projectDir = "features/advanced-ai"
    tasks = ["clean", "build", "test"]
    
    pluginInjection {
        salleVerificationPlugins()
        qualityPlugins()
    }
}
```

## Integration with Salle Verification

The plugin injection system integrates with Salle's verification tasks:

### VerifySallePluginInjection Task

```gradle
task verifySallePluginInjection(type: VerifySallePluginInjection) {
    baseDirPath = project.projectDir.absolutePath
    requiredPluginTasks = ["sallePluginInjectionExample", "salleAdvancedPluginExample"]
    buildFiles = fileTree(dir: project.projectDir, include: "**/*.gradle")
}
```

This task verifies:
- Required plugin injection tasks exist
- Tasks follow Salle persona conventions
- Proper module headers are present
- Persona signatures are included

## Generated Initialization Scripts

The plugin injection system creates Gradle initialization scripts that:

1. Apply specified plugins to all projects
2. Configure plugin-specific settings
3. Maintain Salle persona in comments
4. Include version specifications
5. Handle plugin dependencies

Example generated script:
```gradle
// Auto-generated plugin injection script for Salle 1.0
// Persona: Tough love meets soul care.

allprojects {
    afterEvaluate { project ->
        // Injecting plugin: org.jetbrains.kotlin.android
        project.plugins.apply('org.jetbrains.kotlin.android')
        project.buildscript.dependencies.add('classpath', 'org.jetbrains.kotlin.android:1.9.25')
        
        // Injecting plugin: org.jlleitschuh.gradle.ktlint
        project.plugins.apply('org.jlleitschuh.gradle.ktlint')
        project.buildscript.dependencies.add('classpath', 'org.jlleitschuh.gradle.ktlint:12.1.0')
        
        // Plugin configuration
        project.ext.set('android', 'true')
        project.ext.set('outputToConsole', 'true')
    }
}

// Plugin injection completed - Got it, love.
```

## Error Handling and Validation

### Plugin ID Validation
- Ensures plugin IDs are not blank
- Validates plugin ID format (alphanumeric, dots, hyphens, underscores)
- Prevents injection of malformed plugin specifications

### Build Validation
- Verifies target project directories exist
- Validates build file paths
- Ensures Gradle wrapper is present in target directories

### Configuration Validation
- Checks plugin configuration syntax
- Validates version specifications
- Ensures required dependencies are available

## Examples in Salle Architecture

### Android App Module
```gradle
// In android/app/build.gradle
task sallePluginInjectionExample(type: PluginInjectingGradleBuild) {
    description = "Example task demonstrating plugin injection for Salle nested builds"
    group = "salle-build"
    
    projectDir = project.projectDir.absolutePath
    tasks = ["clean", "assembleDebug"]
    
    injectPlugin("org.jetbrains.kotlin.android", "1.9.25")
    injectPlugin("com.android.application")
    injectPlugin("org.jlleitschuh.gradle.ktlint", "12.1.0", [
        "android": "true",
        "outputToConsole": "true"
    ])
    
    pluginConfigurations = "io.gitlab.arturbosch.detekt:1.23.4;org.jetbrains.dokka:1.9.10"
    enablePluginInjection = true
}
```

### Feature Module Builds
```gradle
task buildAdvancedFeatures(type: PluginInjectingGradleBuild) {
    description = "Build advanced feature modules with consistent plugin setup"
    group = "salle-features"
    
    projectDir = "../features/advanced-ai"
    tasks = ["build", "test", "ktlintCheck"]
    
    pluginInjection {
        salleVerificationPlugins()
        qualityPlugins()
        
        plugin("org.jetbrains.dokka", "1.9.10") {
            put("outputFormat", "html")
            put("outputDirectory", "docs")
        }
    }
}
```

## Testing

The plugin injection system includes comprehensive tests:

- **Unit Tests**: Test plugin configuration parsing and validation
- **Integration Tests**: Test script generation and execution
- **DSL Tests**: Verify DSL extensions work correctly
- **Verification Tests**: Ensure Salle compliance

Run tests with:
```bash
cd buildSrc
./gradlew test
```

## Troubleshooting

### Common Issues

1. **Plugin Not Found**: Ensure plugin ID is correct and version is compatible
2. **Build Failure**: Check that target project has valid Gradle wrapper
3. **Permission Errors**: Verify file permissions on target directories
4. **Version Conflicts**: Use compatible plugin versions

### Debug Logging

Enable debug logging to see plugin injection details:
```bash
./gradlew myNestedBuild --debug
```

This will show:
- Plugin configuration parsing
- Script generation details
- Execution command details
- Error details if injection fails

**Got it, love.**