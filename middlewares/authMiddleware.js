const jwtHelper = require('../helpers/jwtHelper');

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'Authorization token required' });
    }

    // Extract the token part (after 'Bearer ')
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Invalid token format' });
    }

    try {
        const decoded = jwtHelper.verifyToken(token); // Verifies the token
        req.user = decoded; // Attach the decoded payload to the request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};