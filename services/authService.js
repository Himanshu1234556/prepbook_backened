const otpHelper = require('../helpers/otpHelper');
const jwtHelper = require('../helpers/jwtHelper');
const User = require('../models/userModel');
const OTP = require('../models/otpModel');

exports.sendOtp = async (phone) => {
    const user = await User.findByPhone(phone);
    if (!user) await User.insertPhone(phone);
    
    const otp = otpHelper.generateOtp();
    await OTP.insertOtp(phone, otp);
    await otpHelper.sendOtp(phone, otp);
};

exports.verifyOtp = async (phone, otp) => {
    // Find the OTP record
    const otpRecord = await OTP.findOtp(phone, otp);
    if (!otpRecord) throw new Error('Invalid OTP');

    // Find the user by phone number
    const user = await User.findByPhone(phone);
    if (!user) throw new Error('User not found');

    // Generate JWT token using userId as payload
    const token = jwtHelper.generateToken({ userId: user._id });

    // Check if the user profile is updated
    const profileUpdatedKey = !!(user.name && user.email && user.university_id && user.college_id && user.branch_id && user.year);

    // Return the token and profile update status
    return { token, profile_updated: profileUpdatedKey };
};
