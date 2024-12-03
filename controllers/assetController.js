const fs = require('fs');
const path = require('path');

// Function to serve assets (images, videos)
exports.serveAsset = (req, res) => {
    const { assetType, assetName } = req.params;

    // Construct the full asset path based on the type (e.g., banners, videos)
    const assetPath = path.join(__dirname, `../public/assets/${assetType}`, assetName);

    // Check if asset exists
    if (!fs.existsSync(assetPath)) {
        return res.status(404).json({
            status: 'error',
            message: 'Asset not found',
            data: null,
        });
    }

    // Get file stats for caching
    fs.stat(assetPath, (err, stats) => {
        if (err) {
            console.error('Error retrieving file stats:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Server error',
                data: null,
            });
        }

        const ext = path.extname(assetName).toLowerCase();
        let contentType;
        if (ext === '.jpg' || ext === '.jpeg') {
            contentType = 'image/jpeg';
        } else if (ext === '.png') {
            contentType = 'image/png';
        } else if (ext === '.mp4') {
            contentType = 'video/mp4';
        } else {
            contentType = 'application/octet-stream'; // Fallback type
        }

        // Set headers for caching
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${assetName}"`);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Stream the asset to the response
        const stream = fs.createReadStream(assetPath);
        stream.pipe(res).on('error', (err) => {
            console.error('Error serving asset:', err);
            res.status(500).json({
                status: 'error',
                message: 'Error serving asset',
                data: null,
            });
        });
    });
};
