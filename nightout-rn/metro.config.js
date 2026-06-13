const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support OTF fonts
config.resolver.assetExts.push('otf');

module.exports = config;
