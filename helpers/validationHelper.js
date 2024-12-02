// Helper for basic validation, can be expanded as needed
exports.validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // Validates 10-digit phone numbers
    return phoneRegex.test(phone);
};
