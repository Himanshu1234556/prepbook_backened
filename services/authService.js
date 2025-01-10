const otpHelper = require('../helpers/otpHelper');
const jwtHelper = require('../helpers/jwtHelper');
const User = require('../models/userModel');
const NodeCache = require('node-cache');
const otpCache = new NodeCache({ stdTTL: 60 }); // 60 seconds


exports.sendOtp = async (phone) => {
    try {
        const user = await User.findByPhone(phone);
        if (!user) await User.insertPhone(phone);

        const otp = otpHelper.generateOtp();
        otpCache.set(phone, otp);
        await otpHelper.sendOtp(phone, otp);
        console.info(`OTP sent to ${phone}`);
    } catch (error) {
        console.error(`Error sending OTP to ${phone}: ${error.message}`);
        throw error;
    }
};

exports.verifyOtp = async (phone, otp) => {
    try {
        // Check if OTP exists in cache
        const cachedOtp = otpCache.get(phone);
        if (!cachedOtp || cachedOtp.toString() !== otp.toString()) {
            console.error(`Invalid OTP for ${phone}`);
            throw new Error('Invalid OTP');
        }

        // Find the user by phone number
        const user = await User.findByPhone(phone);
        if (!user) {
            console.error(`User not found for ${phone}`);
            throw new Error('User not found');
        }

        // Generate JWT token using userId as payload
        const token = jwtHelper.generateToken({ userId: user.id });

        // Check if the user profile is updated
        const profileUpdatedKey = !!(user.name && user.email && user.university_id && user.college_id && user.branch_id && user.semester_id && user.course_id);

        if (profileUpdatedKey) {
            return { token, profileUpdated: true };
        } else {
            return { token, profileUpdated: false };
        }
    } catch (error) {
        console.error(`Error verifying OTP for ${phone}: ${error.message}`);
        throw error;
    }
};