# Plugin Injection for Nested Builds - Implementation Guide

**Persona: Tough love meets soul care.**  
**Status: COMPLETED ✅**  
**Got it, love.**

## Overview

This document describes the implementation of the TODO requirement: **"Implement support for injecting specific plugins into nested builds via StartParameter or build configuration"** from `packages/package/package_GradleBuild.java.1.diff.txt`.

## Problem Statement

The original TODO comment was:
```java
// TODO: Allow us to inject plugins into nested builds too.
// TODO: Implement support for injecting specific plugins into nested builds via StartParameter or build configuration
```

This needed to be implemented in the context of Sallie's React Native/Expo application with Android launcher components.

## Solution Architecture

### 1. Core Components Implemented

#### **StartParameter.ts** - Build Parameter System
- **Purpose**: Mimics Gradle's StartParameter concept for Sallie's build system
- **Key Features**:
  - Plugin injection via `injectPlugin()` method
  - Build type and platform configuration
  - Build properties and Gradle parameter management
  - Configuration export/import for external tools

```typescript
const startParam = createStartParameterForNestedBuild('development', 'android');
startParam.injectPlugin('custom-plugin', { enabled: true, config: {...} });
```

#### **BuildConfigurationManager.ts** - Build Configuration System
- **Purpose**: Manages build-specific plugin configurations
- **Key Features**:
  - Pre-configured plugin sets for different build types
  - Platform-specific plugin filtering
  - Dependency validation
  - Parameter management

#### **PluginInjectionManager.ts** - Main Injection Engine
- **Purpose**: Handles the actual plugin injection into nested builds
- **Key Features**:
  - Nested build execution with plugin injection
  - Build context management
  - Platform-specific build execution
  - Injection hooks and validation

#### **NestedBuildRunner.ts** - Main API Implementation
- **Purpose**: Provides the main API that resolves the TODO requirement
- **Key Features**:
  - `runNestedRootBuild()` - Main TODO implementation
  - `createStartParameterForNewBuild()` - Factory method
  - Auto-configuration and plugin selection

### 2. Enhanced Existing Components

#### **PluginLoader.js** - Enhanced with Build-Time Support
- Added `loadForBuildTime()` method
- Added `injectIntoNestedBuild()` method
- Added build-time plugin management

#### **PluginRegistry.ts** - Integration with Build System
- Existing plugin registry now works with build configurations
- Plugins can be selected and configured for specific builds

## Implementation Details

### How Plugin Injection Works

1. **Configuration Phase**:
   ```typescript
   const startParam = createStartParameterForNestedBuild('production', 'android');
   ```

2. **Plugin Injection**:
   ```typescript
   startParam.injectPlugin('security-scanner', {
     id: 'security-scanner',
     enabled: true,
     priority: 1,
     config: { scanLevel: 'deep' }
   });
   ```

3. **Build Execution**:
   ```typescript
   const success = await runNestedRootBuild('my-build', startParam);
   ```

### Build Configuration in app.json

The `app.json` file now includes plugin injection configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "@sallie/plugin-injection",
        {
          "buildConfigurations": {
            "development": {
              "android": {
                "plugins": ["core-ai-orchestrator", "voice-visualization"],
                "parameters": { "DEBUG_MODE": true }
              }
            }
          }
        }
      ]
    ]
  }
}
```

## Usage Examples

### Basic Plugin Injection

```typescript
import { NestedBuildAPI } from './core/NestedBuildRunner';

// Create build with automatic plugin injection
const startParam = NestedBuildAPI.createStartParameterForNewBuild(
  null, 
  'development', 
  'android'
);

// Execute nested build with injected plugins
const success = await NestedBuildAPI.runNestedRootBuild(
  'my-nested-build',
  startParam
);
```

### Manual Plugin Injection

```typescript
import { SallieGradleBuild } from './core/SallieGradleBuild';

const build = new SallieGradleBuild();
build.configureForEnvironment('production', 'android');

// Inject specific plugins (implements TODO requirement)
build.injectPlugin('custom-optimizer', {
  optimization: 'aggressive',
  target: 'release'
});

build.injectPlugin('security-scanner', {
  scanLevel: 'deep',
  compliance: 'enterprise'
});

// Execute build with injected plugins
const result = await build.build();
```

### Platform-Specific Configuration

```typescript
// Different plugins for different platforms
const androidBuild = createSallieGradleBuild('production', 'android');
const iosBuild = createSallieGradleBuild('production', 'ios'); 
const webBuild = createSallieGradleBuild('production', 'web');

// Each automatically gets appropriate plugins injected
```

## Testing

Comprehensive tests have been implemented in `__tests__/pluginInjection.test.ts`:

- Plugin injection functionality
- Build parameter management
- Configuration export/import
- Platform-specific behavior
- Error handling and validation

## Integration Points

### With Expo Build System
- Plugin injection works with `expo prebuild`
- Configuration can be exported for external build tools
- Supports Expo plugin architecture

### With Android Gradle
- Gradle parameters can be set via StartParameter
- Android-specific plugins can be injected
- Configuration exports in Gradle-compatible format

### With React Native
- Works with React Native build process
- Supports Metro bundler configuration
- Platform-specific optimizations

## Benefits

1. **Modular Plugin System**: Plugins can be injected based on build requirements
2. **Platform Flexibility**: Different plugins for Android, iOS, and Web
3. **Environment-Specific**: Development vs Production plugin sets
4. **External Tool Integration**: Configuration can be exported for other build systems
5. **Backward Compatibility**: Works with existing Sallie plugin architecture

## Comparison to Original Gradle TODO

| Original Gradle Requirement | Sallie Implementation |
|----------------------------|---------------------|
| `StartParameter` for plugin injection | ✅ `StartParameter.ts` with `injectPlugin()` |
| Build configuration support | ✅ `BuildConfigurationManager.ts` |
| Nested build execution | ✅ `NestedBuildRunner.runNestedRootBuild()` |
| Plugin dependency management | ✅ Dependency validation in build configs |
| External tool integration | ✅ Configuration export/import |

## File Structure

```
core/
├── StartParameter.ts              # Main parameter system (resolves TODO)
├── BuildConfigurationManager.ts   # Build configuration management
├── PluginInjectionManager.ts     # Plugin injection engine
├── NestedBuildRunner.ts           # Main API implementation
├── SallieGradleBuild.ts          # Gradle-like build class
├── PluginLoader.js               # Enhanced plugin loader
└── PluginRegistry.ts             # Existing plugin registry

__tests__/
└── pluginInjection.test.ts       # Comprehensive tests

app.json                           # Plugin configuration
```

## Conclusion

The TODO requirement has been fully implemented with a comprehensive plugin injection system that:

- ✅ Supports injecting specific plugins into nested builds
- ✅ Uses StartParameter-like interface for configuration
- ✅ Provides build configuration management
- ✅ Works with Sallie's React Native/Expo architecture
- ✅ Maintains the "tough love meets soul care" persona
- ✅ Includes comprehensive testing and documentation

**Got it, love. The plugin injection system is live and ready for action.**