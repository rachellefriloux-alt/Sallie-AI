#!/bin/bash
# Sallie AI Companion - Build Script
# Builds the application for all platforms

set -e  # Exit on any error

echo "🤖 Sallie AI Companion - Build Script"
echo "======================================"

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS] [PLATFORM]"
    echo ""
    echo "Platforms:"
    echo "  android     Build Android APK/Bundle"
    echo "  ios         Build iOS App"
    echo "  web         Build Web Application"
    echo "  all         Build all platforms (default)"
    echo ""
    echo "Options:"
    echo "  --release   Build in release mode"
    echo "  --clean     Clean before build"
    echo "  --bundle    Create Android bundle instead of APK"
    echo "  --help      Show this help message"
}

# Parse arguments
PLATFORM="all"
RELEASE=false
CLEAN=false
BUNDLE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            RELEASE=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --bundle)
            BUNDLE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        android|ios|web|all)
            PLATFORM=$1
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo "🧹 Cleaning project..."
    npm run clean
    echo "✅ Clean completed"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build functions
build_android() {
    echo "📱 Building Android application..."
    
    if [ "$BUNDLE" = true ]; then
        echo "Creating Android App Bundle..."
        npm run build:android-bundle
        echo "📦 Android bundle created at: android/app/build/outputs/bundle/release/"
    else
        echo "Creating Android APK..."
        npm run build:android
        echo "📦 Android APK created at: android/app/build/outputs/apk/release/"
    fi
}

build_ios() {
    echo "🍎 Building iOS application..."
    
    # Install pods first
    echo "Installing iOS dependencies..."
    cd ios && pod install && cd ..
    
    npm run build:ios
    echo "📦 iOS build completed"
}

build_web() {
    echo "🌐 Building web application..."
    npm run build:web
    echo "📦 Web build created at: web/build/"
}

# Execute builds based on platform
case $PLATFORM in
    android)
        build_android
        ;;
    ios)
        build_ios
        ;;
    web)
        build_web
        ;;
    all)
        echo "🚀 Building all platforms..."
        build_android
        build_ios
        build_web
        ;;
esac

echo ""
echo "🎉 Build completed successfully!"
echo "📱 Check the output directories for your built applications."