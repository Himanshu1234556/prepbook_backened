const { fetchSubjectsForUser } = require('../models/subjectModel');
const redis = require('../config/redisClient'); // Redis client
const NodeCache = require('node-cache'); // NodeCache client

const localCache = new NodeCache(); // Initialize NodeCache
const CACHE_ENABLED = false; // Toggle this to enable/disable caching

exports.getSubjectListForUser = async (req, res) => {
    const { userId } = req.user; // Get user ID from JWT

    try {
        const cacheKey = `userSubjects:${userId}`;
        let cachedSubjects = null;

        if (CACHE_ENABLED) {
            // Check local cache first
            cachedSubjects = localCache.get(cacheKey);

            if (!cachedSubjects) {
                // Check Redis if not in local cache
                const redisCachedSubjects = await redis.get(cacheKey);

                if (redisCachedSubjects) {
                    cachedSubjects = JSON.parse(redisCachedSubjects);
                    localCache.set(cacheKey, cachedSubjects, 3600); // Cache for 1 hour
                }
            }
        }

        if (!cachedSubjects) {
            // Fetch subjects if not cached
            cachedSubjects = await fetchSubjectsForUser(userId);
            
            if (CACHE_ENABLED) {
                const cacheTTL = 3600; // 1 hour cache TTL
                await redis.set(cacheKey, JSON.stringify(cachedSubjects), 'EX', cacheTTL);
                localCache.set(cacheKey, cachedSubjects, cacheTTL);
            }
        }

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
