const redis = require('../config/redisClient');
const pool = require('../config/db');
const jwtHelper = require('../helpers/jwtHelper');

const analyticsMiddleware = async (req, res, next) => {
    let userId = 0; // Default for unauthenticated users
    const authHeader = req.headers['authorization'];

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwtHelper.verifyToken(token);
                if (decoded && decoded.userId) {
                    userId = decoded.userId; // Set actual user ID
                }
            } catch (err) {
                console.error("JWT Verification Failed:", err);
            }
        }
    }

    // Track API request in Redis
    const endpoint = req.originalUrl;
    const method = req.method;
    const key = `analytics:${userId}:${endpoint}:${method}`;

    console.log(`Received analytics data - User ID: ${userId}, Endpoint: ${endpoint}, Method: ${method}`);

    try {
        const newCount = await redis.incr(key); // Increment API call count
        await redis.expire(key, 86400); // Set expiration for 24 hours
        console.log(`Updated Redis key: ${key}, New Count: ${newCount}`);
    } catch (err) {
        console.error("Redis Tracking Error:", err);
    }

    next();
};

// Function to save analytics data from Redis to PostgreSQL
const saveAnalyticsToDB = async () => {
    try {
        console.log("Starting analytics data transfer to PostgreSQL...");
        const keys = await redis.keys('analytics:*');

        for (const key of keys) {
            const count = await redis.get(key);
            const [_, userId, endpoint, method] = key.split(':');

            console.log(`Processing key: ${key}, Count: ${count}`);

            await pool.query(
                `INSERT INTO analytics (user_id, endpoint, method, count)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, endpoint, method) 
                DO UPDATE SET count = analytics.count + EXCLUDED.count`,
                [userId, endpoint, method, count]
            );

            console.log(`Saved to PostgreSQL: User ${userId}, Endpoint ${endpoint}, Method ${method}, Count ${count}`);

            //await redis.del(key); // Clear Redis key after saving
            console.log(`Deleted Redis key: ${key}`);
        }

        console.log("Analytics data transfer completed.");
    } catch (err) {
        console.error("Error saving analytics to DB:", err);
    }
};

// Run every hour to persist data
setInterval(saveAnalyticsToDB, 3600000);

module.exports = analyticsMiddleware;
