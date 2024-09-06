const userService = require('../services/userService');

exports.updateProfile = async (req, res) => {
    try {
        const { phone, name, email, university_id, college_id, branch_id, year } = req.body;
        await userService.updateUserProfile(phone, { name, email, university_id, college_id, branch_id, year });
        res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
