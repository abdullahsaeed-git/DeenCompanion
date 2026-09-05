const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports to fix adhan package resolution
config.resolver.unstable_enablePackageExports = false;

module.exports = config;