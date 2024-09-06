// Helper to generate a random 6-digit OTP
exports.generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// Simulate sending OTP (can be replaced with an actual SMS service)
exports.sendOtp = async (phone, otp) => {
    console.log(`Sending OTP ${otp} to ${phone}`);
    // Use an actual SMS service like Twilio, Nexmo, etc.
};
