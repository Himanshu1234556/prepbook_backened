const pool = require('../db'); // Import the pool instance

// Function to fetch app info from the DB
async function getAppFromDB(tenantId) {
    try {
        const result = await pool.query('SELECT * FROM apps WHERE tenant_id = $1', [tenantId]);

        if (result.rows.length > 0) {
            return result.rows[0]; // Return the app data
        }

        return null; // App not found
    } catch (error) {
        console.error('Error fetching app data:', error);
        throw new Error('Error fetching app data from database');
    }
}

module.exports = { getAppFromDB };
