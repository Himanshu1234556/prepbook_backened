const db = require('../config/db'); // Assuming you have a db connection file
const bcrypt = require('bcrypt');
const jwtHelper = require('../helpers/jwtHelper');





// Function to update user profile
exports.updateUserProfile = async (userId, profileData) => {
    const { name, email, university_id, college_id, course_id, branch_id, semester_id, subjects } = profileData;

    const query = `
        UPDATE users 
        SET name = $1, email = $2, university_id = $3, college_id = $4, 
            course_id = $5, branch_id = $6, semester_id = $7, subjects = $8, 
            updated_at = NOW() 
        WHERE id = 2 
        RETURNING *`;
console.log(query);
    const values = [name, email, university_id, college_id, course_id, branch_id, semester_id, subjects];
    const result = await db.query(query, values);
    return result.rows[0];
};



