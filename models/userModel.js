const pool = require('../config/db');

const User = {
    findByPhone: async (phone) => {
        const res = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
        return res.rows[0];
    },
    insertPhone: async (phone) => {
        await pool.query('INSERT INTO users (phone) VALUES ($1)', [phone]);
    },
    updateUser: async (data, phone) => {
        const fields = Object.keys(data).map((key, idx) => `${key} = $${idx + 1}`);
        const values = Object.values(data);
        values.push(phone);
        await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE phone = $${values.length}`, values);
    }
};

module.exports = User;
