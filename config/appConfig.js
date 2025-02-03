const localcache = require('../config/localcache');
const { getAppFromDB } = require('../services/appService'); // This will interact with DB

// Function to get app info (from cache or DB)
async function getAppInfo(tenantId) {
    // Check cache first
    const cachedAppData = localcache.get(tenantId);
    
    if (cachedAppData) {
        console.log('Returning app data from cache');
        return cachedAppData;
    }

    // If not in cache, fetch from DB
    const appData = await getAppFromDB(tenantId);

    // Cache the app data for future requests if found
    if (appData) {
        localcache.set(tenantId, appData);
    }

    return appData;
}

module.exports = {
    getAppInfo,
};
