const axios = require('axios');

// Helper to generate a random 4-digit OTP
exports.generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
};


exports.sendOtpViaSms = async (phone, otp) => {
    const apiUrl = `https://sms.adservs.co.in/vb/apikey.php?apikey=N4RF6ByLvICTL5UD&senderid=PRSNCE&number=${phone}&templateid=1007786941630559827&message=Dear%20user%20${otp}%20is%20your%20one%20time%20password%20(OTP)%20for%20Login/Register.%20Please%20enter%20to%20proceed.%20Thank%20You,%20Presence%20Learning`;

    try {
        const response = await axios.get(apiUrl);
        console.log(`SMS API response:`, response.data);
    } catch (error) {
        console.error(`Error sending OTP via SMS: ${error.message}`);
    }
};

// Send OTP over WhatsApp, always adding country code '91'
exports.sendOtpViaWhatsApp = async (phone, otp) => {
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

// Send OTP via WhatsApp Cloud API
exports.sendOtpViaWhatsAppCloud = async (phone, otp) => {
    const url = `https://crmapi.multicrm.app/api/meta/v19.0/572356625950623/messages`;
    const accessToken = `Bearer mOqcDNGh43kfCoYVzAAIk6rVZVvAKc1u7MCw0zOiahjWdYHrB3dR3XjE2mLvkVU5ERVJTQ09SRQhYREFTSAvfAT7aUz0PvtygREFTSAnKDWrhucW88kR9ZtQcsrkaryLDP4OOLx1KaSEGLVU5ERVJTQ09SRQJHbtL25R7vpKsFvXhN3zxN0QhasZuWgJV0OpIzsYb0wLzNlNUhGKNdDGrGis7dYMtHw2NP2Z0tRGLhuzo5oicpKi`;
    const phoneWithCountryCode = `91${phone}`;
    const messageData = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneWithCountryCode, // Phone number with country code
        type: "template",
        template: {
            name: "otp_verify", // WhatsApp Cloud template name
            language: {
                policy: "deterministic",
                code: "en"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: otp // OTP in the message body
                        }
                    ]
                },
                {
                    type: "button",
                    sub_type: "copy_code",  // ✅ Use "copy_code" for copy OTP button
                    index: 0,
                    parameters: [
                        {
                            type: "text",
                            text: otp // ✅ OTP value for the button
                        }
                    ]
                }
            ]
        }
    };

    try {
        const response = await axios.post(url, messageData, {
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            }
        });

        console.log(`OTP ${otp} sent to ${phone} via WhatsApp Cloud API:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error sending OTP via WhatsApp Cloud API:`, error.response?.data || error.message);
        throw error;
    }
};



exports.sendWhatsAppMessage = async (phone, templateName, variables = []) => {
    try {
        const url = "https://crmapi.multicrm.app/api/meta/v19.0/572356625950623/messages";
        const accessToken = "Bearer mOqcDNGh43kfCoYVzAAIk6rVZVvAKc1u7MCw0zOiahjWdYHrB3dR3XjE2mLvkVU5ERVJTQ09SRQhYREFTSAvfAT7aUz0PvtygREFTSAnKDWrhucW88kR9ZtQcsrkaryLDP4OOLx1KaSEGLVU5ERVJTQ09SRQJHbtL25R7vpKsFvXhN3zxN0QhasZuWgJV0OpIzsYb0wLzNlNUhGKNdDGrGis7dYMtHw2NP2Z0tRGLhuzo5oicpKi";
        const phoneWithCountryCode = `91${phone}`;

        // Constructing parameters dynamically
        const parameters = variables.map(text => ({ type: "text", text }));

        const messageData = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phoneWithCountryCode,
            type: "template",
            template: {
                name: templateName,
                language: {
                    policy: "deterministic",
                    code: "en"
                },
                components: [
                    {
                        type: "body",
                        parameters
                    }
                ]
            }
        };

        const response = await axios.post(url, messageData, {
            headers: {
                "Authorization": accessToken,
                "Content-Type": "application/json"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error sending WhatsApp message:", error.response?.data || error.message);
        throw error;
    }
};
