const authService = require('../services/authService');

exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        await authService.sendOtp(phone);
        res.status(200).json({
            status: 'success',
            message: 'OTP sent',
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            data: null,
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const result = await authService.verifyOtp(phone, otp);
        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully',
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message,
            data: null,
        });
    }
};
