const redis = require('../config/redisClient'); // Import your Redis client
const NodeCache = require('node-cache'); // Import node-cache
const { Worker } = require('worker_threads');
const path = require('path');

// Set up node-cache with a standard TTL (e.g., 300 seconds)
const localCache = new NodeCache({ stdTTL: 300 });

exports.fetchEbooks = async (req, res) => {
    try {
        const { userId } = req.user; // Assuming `userId` is attached to the request from middleware
        const cacheKey = `ebooks:${userId}`;

        // First, check the local node-cache
        const localCachedData = localCache.get(cacheKey);
        if (localCachedData) {
            return res.status(200).json({
                status: 'success',
                message: 'Ebooks fetched from cache',
                data: localCachedData
            });
        }

        // If not in node-cache, check Redis
        const redisCachedData = await redis.get(cacheKey);
        if (redisCachedData) {
            const parsedData = JSON.parse(redisCachedData);
            localCache.set(cacheKey, parsedData); // Populate node-cache from Redis
            return res.status(200).json({
                status: 'success',
                message: 'Ebooks fetched from Redis cache',
                data: parsedData
            });
        }

        const ebookWorkerPath = path.join(__dirname, '../worker_threads/ebookWorker.js');

        // Create a worker for ebooks
        const ebookWorker = new Worker(ebookWorkerPath, { workerData: { userId } });

        // Fetch data using the worker thread
        const ebooks = await new Promise((resolve, reject) => {
            ebookWorker.on('message', resolve);
            ebookWorker.on('error', reject);
        });

        // Validate results to ensure successful data retrieval
        if (ebooks) {
            // Store the results in both local node-cache and Redis with an expiration time (e.g., 300 seconds)
            localCache.set(cacheKey, ebooks);
            await redis.set(cacheKey, JSON.stringify(ebooks), 'EX', 300);

            return res.status(200).json({
                status: 'success',
                message: 'Ebooks fetched successfully',
                data: ebooks
            });
        } else {
            // If data is missing, log an error and send a failure message
            throw new Error('Failed to fetch data from the worker.');
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            data: null
        });
    }
};
