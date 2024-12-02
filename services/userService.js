const db = require('../config/db'); // Assuming you have a db connection file

// Function to update user profile
exports.updateUserProfile = async (userId, profileData) => {
    // Build the dynamic query based on provided fields
    const fields = Object.keys(profileData);
    const values = Object.values(profileData);
    
    // Create the SET clause dynamically
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const query = `
        UPDATE users
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${fields.length + 1}
        RETURNING *`;

    const result = await db.query(query, [...values, userId]);
    return result.rows[0];
};
