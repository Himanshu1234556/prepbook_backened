const { fetchSubjectsForUser } = require('../models/subjectModel');
const redis = require('../config/redisClient'); // Redis client
const NodeCache = require('node-cache'); // NodeCache client

const localCache = new NodeCache(); // Initialize NodeCache

exports.getSubjectListForUser = async (req, res) => {
    const { userId } = req.user; // Get user ID from JWT

    try {
        // Create a unique cache key for the user
        const cacheKey = `userSubjects:${userId}`;

        // Check local cache first
        let cachedSubjects = localCache.get(cacheKey);

        if (!cachedSubjects) {
            // Check Redis if not in local cache
            const redisCachedSubjects = await redis.get(cacheKey);

            if (redisCachedSubjects) {
                // Parse Redis data and set it in the local cache
                cachedSubjects = JSON.parse(redisCachedSubjects);
                localCache.set(cacheKey, cachedSubjects, 3600); // Cache for 1 hour
            } else {
                // Fetch subjects if not cached
                cachedSubjects = await fetchSubjectsForUser(userId);

                // Store fetched subjects in both Redis and NodeCache
                const cacheTTL = 3600; // 1 hour cache TTL
                await redis.set(cacheKey, JSON.stringify(cachedSubjects), 'EX', cacheTTL);
                localCache.set(cacheKey, cachedSubjects, cacheTTL);
            }
        }

        // Send response with subjects list
        res.status(200).json({
            status: 'success',
            message: 'Subjects fetched successfully',
            data: cachedSubjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
