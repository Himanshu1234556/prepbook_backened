const pool = require('../config/db');

const OTP = {
    insertOtp: async (phone, otp) => {
        await pool.query('INSERT INTO otp (phone, otp, timestamp) VALUES ($1, $2, NOW())', [phone, otp]);
    },
    findOtp: async (phone, otp) => {
        const res = await pool.query('SELECT * FROM otp WHERE phone = $1 AND otp = $2', [phone, otp]);
        return res.rows[0];
    }
};

module.exports = OTP;
