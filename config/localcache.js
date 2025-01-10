const NodeCache = require('node-cache');

// Initialize a single instance of NodeCache
const localCache = new NodeCache({ stdTTL: 300 }); // Disable TTL for now

module.exports = localCache;
