const pool = require('../config/db');

// Fetch long-term analytics from PostgreSQL
const getLongTermAnalytics = async () => {
    try {
        return await pool.query(`
            SELECT user_id, endpoint, method, count, last_updated 
            FROM analytics 
            ORDER BY last_updated DESC
        `);
    } catch (error) {
        console.error('Error fetching long-term analytics:', error);
        throw error;
    }
};

// Fetch top users
const getTopUsers = async () => {
    try {
        return await pool.query(`
            SELECT user_id, SUM(count) AS total_requests 
            FROM analytics 
            WHERE user_id != 0
            GROUP BY user_id 
            ORDER BY total_requests DESC 
            LIMIT 10
        `);
    } catch (error) {
        console.error('Error fetching top users:', error);
        throw error;
    }
};

// Fetch most accessed endpoints
const getTopEndpoints = async () => {
    try {
        return await pool.query(`
            SELECT endpoint, method, SUM(count) AS total_requests 
            FROM analytics 
            GROUP BY endpoint, method 
            ORDER BY total_requests DESC 
            LIMIT 10
        `);
    } catch (error) {
        console.error('Error fetching top endpoints:', error);
        throw error;
    }
};

module.exports = { getLongTermAnalytics, getTopUsers, getTopEndpoints };
