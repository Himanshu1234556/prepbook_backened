const userService = require('../services/userService');
const redis = require('../config/redisClient'); // Import your Redis client
const NodeCache = require('node-cache'); // Import node-cache
const { Worker } = require('worker_threads');
const path = require('path');

// Set up node-cache with a standard TTL (e.g., 300 seconds)
const localCache = new NodeCache({ stdTTL: 300 });

exports.fetchEbooksAndFreeResources = async (req, res) => {
    try {
        const { userId } = req.user; // Assuming `userId` is attached to the request from middleware
        const cacheKey = `ebooks_free_resources:${userId}`;

        // First, check the local node-cache
        const localCachedData = localCache.get(cacheKey);
        if (localCachedData) {
            return res.status(200).json(localCachedData); // Return data from local cache
        }

        // If not in node-cache, check Redis
        const redisCachedData = await redis.get(cacheKey);
        if (redisCachedData) {
            const parsedData = JSON.parse(redisCachedData);
            localCache.set(cacheKey, parsedData); // Populate node-cache from Redis
            return res.status(200).json(parsedData); // Return cached data from Redis
        }

        const ebookWorkerPath = path.join(__dirname, '../worker_threads/ebookWorker.js');
        const freeResourceWorkerPath = path.join(__dirname, '../worker_threads/freeResourceWorker.js');

        // Create workers for ebooks and free resources
        const ebookWorker = new Worker(ebookWorkerPath, { workerData: { userId } });
        const freeResourceWorker = new Worker(freeResourceWorkerPath, { workerData: { userId } });

        // Run both workers concurrently and gather results
        const [ebooks, freeResources] = await Promise.all([
            new Promise((resolve, reject) => {
                ebookWorker.on('message', resolve);
                ebookWorker.on('error', reject);
            }),
            new Promise((resolve, reject) => {
                freeResourceWorker.on('message', resolve);
                freeResourceWorker.on('error', reject);
            })
        ]);

        const result = { ebooks, freeResources };

        // Store the results in both local node-cache and Redis with an expiration time (e.g., 300 seconds)
        localCache.set(cacheKey, result);
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
