const { cacheEbooksAndFreeResources } = require('../helpers/resourceCache');

exports.fetchEbooksAndFreeResources = async (req, res) => {
    try {
        const { userId } = req.user; // Assuming `userId` is attached to the request from middleware

        // Use the helper function to fetch or cache ebooks and free resources
        const resources = await cacheEbooksAndFreeResources(userId);

        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
