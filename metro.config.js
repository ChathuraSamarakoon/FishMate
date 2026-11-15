const { getDefaultConfig } = require('expo/metro-config');
const limitMetroCache = require('./scripts/limit-metro-cache');

const config = getDefaultConfig(__dirname);

// Limit parallel file processing and transforms on Windows to reduce EMFILE pressure.
// Keep Expo's resolver, watch folders, and Fast Refresh defaults intact.
config.maxWorkers = process.platform === 'win32' ? 2 : config.maxWorkers;

if (process.platform === 'win32') {
  config.cacheStores = limitMetroCache(config.cacheStores);
}

module.exports = config;
