const axios = require('axios');

// Helper to generate a random 4-digit OTP
exports.generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
};

// Send OTP over WhatsApp, always adding country code '91'
exports.sendOtp = async (phone, otp) => {
    // Always prepend '91' to the phone number
    const phoneWithCountryCode = `91${phone}`;
    const chatId = `${phoneWithCountryCode}@c.us`; // WhatsApp Chat ID format

    const payload = {
        chatId: chatId,
        reply_to: null,
        text: `Your OTP is: ${otp}`,
        session: 'UZeJjpRcOXzn'
    };

    try {
        const response = await axios.post('http://185.193.19.48:3000/api/sendText', payload, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 201) {
            console.log(`OTP ${otp} sent to ${phoneWithCountryCode} via WhatsApp`);
        } else {
            console.log(`Failed to send OTP to ${phoneWithCountryCode}. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error sending OTP: ${error.message}`);
    }
};
