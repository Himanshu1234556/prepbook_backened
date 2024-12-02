const { parentPort } = require('worker_threads');
const otpHelper = require('../helpers/otpHelper');

// Worker thread listens for tasks
parentPort.on('message', async (data) => {
    try {
        const otp = otpHelper.generateOtp();
        await otpHelper.sendOtp(data.phone, otp);
        parentPort.postMessage({ success: true, otp });
    } catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
});
