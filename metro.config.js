const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom resolver to handle .tsx files when importing .js
config.resolver = {
    ...config.resolver,
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf'],
};

module.exports = config;
