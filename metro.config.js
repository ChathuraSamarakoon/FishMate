const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Limit parallel file processing and transforms on Windows to reduce EMFILE pressure.
// Keep Expo's resolver, watch folders, and Fast Refresh defaults intact.
config.maxWorkers = process.platform === 'win32' ? 2 : config.maxWorkers;

module.exports = config;
