const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Function to generate JWT
exports.generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '122h' });
};

// Function to verify JWT
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
