const authService = require('../services/authService');

exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        await authService.sendOtp(phone);
        res.status(200).json({ message: 'OTP sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const result = await authService.verifyOtp(phone, otp);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
