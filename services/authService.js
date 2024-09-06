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
    const otpRecord = await OTP.findOtp(phone, otp);
    if (!otpRecord) throw new Error('Invalid OTP');
    
    const token = jwtHelper.generateToken({ phone });
    const user = await User.findByPhone(phone);
    
    const profileUpdatedKey = !!(user.name && user.email && user.university_id && user.college_id && user.branch_id && user.year);
    return { token, profile_updated: profileUpdatedKey };
};
