const redis = require('../config/redisClient');
const analyticsModel = require('../models/analyticsModel');

// **Fetch Real-time Analytics (Redis)**
const getRealtimeAnalytics = async (req, res) => {
    try {
        const keys = await redis.keys('analytics:*');
        let analyticsData = [];

        for (const key of keys) {
            const count = await redis.get(key);
            const [_, userId, endpoint, method] = key.split(':');
            analyticsData.push({ user_id: userId, endpoint, method, count });
        }

        res.json({ status: 'success', data: analyticsData });
    } catch (err) {
        console.error("Error fetching real-time analytics:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// **Fetch Long-term Analytics (PostgreSQL)**
const getLongTermAnalytics = async (req, res) => {
    try {
        const result = await analyticsModel.getLongTermAnalytics();
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error("Error fetching long-term analytics:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// **Fetch Top API Users**
const getTopUsers = async (req, res) => {
    try {
        const result = await analyticsModel.getTopUsers();
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error("Error fetching top users:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// **Fetch Most Accessed Endpoints**
const getTopEndpoints = async (req, res) => {
    try {
        const result = await analyticsModel.getTopEndpoints();
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error("Error fetching top endpoints:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getRealtimeAnalytics, getLongTermAnalytics, getTopUsers, getTopEndpoints };
