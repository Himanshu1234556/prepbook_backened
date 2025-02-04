const pool = require("../../config/db");

// Create a new user
const createUser = async (user) => {
    const { name, email, phone, university_id, college_id, course_id, branch_id, semester_id, subjects, fcm_token, refresh_token } = user;
    const query = `
        INSERT INTO public.users 
        (name, email, phone, university_id, college_id, course_id, branch_id, semester_id, subjects, fcm_token, refresh_token, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *;
    `;
    const values = [name, email, phone, university_id, college_id, course_id, branch_id, semester_id, subjects, fcm_token, refresh_token];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Get all users
const getAllUsers = async () => {
    const { rows } = await pool.query("SELECT * FROM public.users ORDER BY created_at DESC");
    return rows;
};

// Get user by ID
const getUserById = async (id) => {
    const { rows } = await pool.query("SELECT * FROM public.users WHERE id = $1", [id]);
    return rows[0];
};

// Update user
const updateUser = async (id, user) => {
    const { name, email, phone, university_id, college_id, course_id, branch_id, semester_id, subjects, fcm_token, refresh_token } = user;
    const query = `
        UPDATE public.users
        SET name = $1, email = $2, phone = $3, university_id = $4, college_id = $5, 
            course_id = $6, branch_id = $7, semester_id = $8, subjects = $9, 
            fcm_token = $10, refresh_token = $11, updated_at = NOW()
        WHERE id = $12
        RETURNING *;
    `;
    const values = [name, email, phone, university_id, college_id, course_id, branch_id, semester_id, subjects, fcm_token, refresh_token, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Delete user
const deleteUser = async (id) => {
    const { rows } = await pool.query("DELETE FROM public.users WHERE id = $1 RETURNING *", [id]);
    return rows[0];
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
