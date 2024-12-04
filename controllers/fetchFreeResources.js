const redis = require('../config/redisClient'); // Import your Redis client
const NodeCache = require('node-cache'); // Import node-cache
const { Worker } = require('worker_threads');
const path = require('path');

// Set up node-cache with a standard TTL (e.g., 300 seconds)
const localCache = new NodeCache({ stdTTL: 300 });

exports.fetchFreeResources = async (req, res) => {
    try {
        const { userId } = req.user; // Assuming `userId` is attached to the request from middleware

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is missing',
                data: null
            });
        }

        const cacheKey = `free_resources:${userId}`;

        // First, check the local node-cache
        const localCachedData = localCache.get(cacheKey);
        if (localCachedData) {
            console.log(`[CACHE] Free resources fetched from local cache for user ${userId}`);
            return res.status(200).json({
                status: 'success',
                message: 'Free resources fetched from local cache',
                data: localCachedData
            });
        }

        // Then, check Redis cache
        let redisCachedData;
        try {
            redisCachedData = await redis.get(cacheKey);
        } catch (error) {
            console.error('Error fetching data from Redis:', error.message);
        }

        if (redisCachedData) {
            console.log(`[CACHE] Free resources fetched from Redis cache for user ${userId}`);
            return res.status(200).json({
                status: 'success',
                message: 'Free resources fetched from Redis cache',
                data: JSON.parse(redisCachedData)
            });
        }

        // Worker setup and data fetching
        const freeResourceWorkerPath = path.join(__dirname, '../worker_threads/freeResourceWorker.js');
        const freeResourceWorker = new Worker(freeResourceWorkerPath, { workerData: { userId } });

        const freeResources = await new Promise((resolve, reject) => {
            freeResourceWorker.on('message', resolve);
            freeResourceWorker.on('error', (error) => {
                reject(new Error(`Worker thread error: ${error.message}`));
            });
        });

        if (freeResources) {
            // Store in local cache and Redis
            localCache.set(cacheKey, freeResources);
            try {
                await redis.set(cacheKey, JSON.stringify(freeResources), 'EX', 300);
            } catch (error) {
                console.error('Error setting data to Redis:', error.message);
            }

            console.log(`[DATABASE] Free resources fetched from worker for user ${userId}`);
            return res.status(200).json({
                status: 'success',
                message: 'Free resources fetched successfully',
                data: freeResources
            });
        } else {
            throw new Error('Failed to fetch data from the worker.');
        }
    } catch (error) {
        console.error('Error in fetchFreeResources:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            data: null
        });
    }
};
