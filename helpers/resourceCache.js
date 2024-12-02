// resourceCache.js
const redis = require('../config/redisClient'); // Import your Redis client
const { Worker } = require('worker_threads');
const path = require('path');

const cacheEbooksAndFreeResources = async (userId) => {
    const cacheKey = `ebooks_free_resources:${userId}`;

    // Check if data is cached in Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData); // Return cached data
    }

    const ebookWorkerPath = path.join(__dirname, '../worker_threads/ebookWorker.js');
    const freeResourceWorkerPath = path.join(__dirname, '../worker_threads/freeResourceWorker.js');

    // Creating workers for ebooks and free resources
    const ebookWorker = new Worker(ebookWorkerPath, { workerData: { userId } });
    const freeResourceWorker = new Worker(freeResourceWorkerPath, { workerData: { userId } });

    // Run both workers concurrently and gather results
    const results = await Promise.allSettled([
        new Promise((resolve) => {
            ebookWorker.on('message', resolve);
        }),
        new Promise((resolve) => {
            freeResourceWorker.on('message', resolve);
        })
    ]);

    // Extract results and cache them
    const ebooks = results[0].status === 'fulfilled' ? results[0].value : null;
    const freeResources = results[1].status === 'fulfilled' ? results[1].value : null;

    // Store the results in Redis with an expiration time (e.g., 300 seconds)
    await redis.set(cacheKey, JSON.stringify({ ebooks, freeResources }), 'EX', 300);

    return { ebooks, freeResources };
};

module.exports = { cacheEbooksAndFreeResources };
