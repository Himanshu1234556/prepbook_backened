const otpHelper = require('../helpers/otpHelper');
const jwtHelper = require('../helpers/jwtHelper');
const User = require('../models/userModel');
const redis = require('../config/redisClient'); // Ensure correct path

const OTP_EXPIRATION_TIME = 120; // OTP expiry in seconds
const MAX_OTP_HISTORY = 3; // Store only the last 3 OTPs

exports.sendOtp = async (phone) => {
    try {
        const user = await User.findByPhone(phone);
        if (!user) await User.insertPhone(phone);

        // Generate OTP (or use 1234 for a test phone)
        const otp = phone === "8630171310" ? "1234" : otpHelper.generateOtp();
        const timestamp = Date.now();

        // Store OTP with timestamp in Redis List
        const otpData = JSON.stringify({ otp, timestamp });
        await redis.lpush(phone, otpData);

        // Keep only the last 3 OTPs
        await redis.ltrim(phone, 0, MAX_OTP_HISTORY - 1);

        // Set expiration time for the OTP list
        await redis.expire(phone, OTP_EXPIRATION_TIME);

        // Determine if OTP is being resent
        const isResend = (await redis.llen(phone)) > 1;

        if (!isResend) {
            // First-time OTP → Send via SMS
            await otpHelper.sendOtpViaSms(phone, otp);
            console.info(`OTP sent via SMS to ${phone}`);
        } else {
            // Resending OTP → Send via WhatsApp
            await otpHelper.sendOtpViaSms(phone, otp);
            console.info(`OTP resent via SMS to ${phone}`);

            await otpHelper.sendOtpViaWhatsApp(phone, otp);
            console.info(`OTP resent via WhatsApp to ${phone}`);

            await otpHelper.sendOtpViaWhatsAppCloud(phone, otp);
            console.info(`OTP resent via WhatsApp Cloud to ${phone}`);
        }
    } catch (error) {
        console.error(`Error sending OTP to ${phone}: ${error.message}`);
        throw error;
    }
};

exports.verifyOtp = async (phone, otp) => {
    try {
        // Retrieve the last 3 OTPs from Redis
        const storedOtps = await redis.lrange(phone, 0, MAX_OTP_HISTORY - 1);

        if (!storedOtps || storedOtps.length === 0) {
            console.error(`Invalid OTP for ${phone}`);
            throw new Error('Invalid OTP');
        }

        let isValid = false;
        for (const otpData of storedOtps) {
            const { otp: storedOtp, timestamp } = JSON.parse(otpData);

            // Check if OTP matches and is within the expiry window
            if (storedOtp.toString() === otp.toString() && (Date.now() - timestamp) <= OTP_EXPIRATION_TIME * 1000) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            console.error(`Invalid OTP for ${phone}`);
            throw new Error('Invalid OTP');
        }

        // Remove all OTPs after successful verification
        await redis.del(phone);

        // Find the user by phone number
        const user = await User.findByPhone(phone);
        if (!user) {
            console.error(`User not found for ${phone}`);
            throw new Error('User not found');
        }

        // Generate JWT token using userId as payload
        const token = jwtHelper.generateToken({ userId: user.id });

        // Check if the user profile is updated
        const profileUpdated = !!(user.name && user.email && user.university_id &&
            user.college_id && user.branch_id && user.semester_id && user.course_id);

        // **Response remains the same**
        return { token, profileUpdated };
    } catch (error) {
        console.error(`Error verifying OTP for ${phone}: ${error.message}`);
        throw error;
    }
};
