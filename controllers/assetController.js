const fs = require('fs');
const path = require('path');

// Function to serve assets (images, videos)
exports.serveAsset = (req, res) => {
    const { assetType, assetName } = req.params;

    // Construct the full asset path
    const assetPath = path.join(__dirname, `../public/assets/${assetType}`, assetName);

    // Check if the file exists
    if (!fs.existsSync(assetPath)) {
        return res.status(404).json({
            status: 'error',
            message: 'Asset not found',
        });
    }

    // Get the file extension for setting the content type
    const ext = path.extname(assetName).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.pdf': 'application/pdf',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Get file stats for conditional requests (etag, last-modified)
    fs.stat(assetPath, (err, stats) => {
        if (err) {
            console.error('Error retrieving file stats:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Server error',
            });
        }

        const { mtime, size } = stats;
        const lastModified = mtime.toUTCString();
        const etag = `${size}-${mtime.getTime()}`;

        // Set common headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
        res.setHeader('Last-Modified', lastModified);
        res.setHeader('ETag', etag);

        // Add headers specific to media types
        if (contentType.startsWith('image/')) {
            res.setHeader('Content-Disposition', `inline; filename="${assetName}"`);
        } else if (contentType.startsWith('video/')) {
            res.setHeader('Accept-Ranges', 'bytes');
        }

        // Handle conditional GET (304 Not Modified)
        if (req.headers['if-none-match'] === etag || req.headers['if-modified-since'] === lastModified) {
            return res.status(304).end();
        }

        // Stream the file for chunking
        const range = req.headers.range;
        if (range) {
            const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
            const start = parseInt(startStr, 10);
            const end = endStr ? parseInt(endStr, 10) : size - 1;

            if (start >= size || end >= size) {
                return res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
            }

            res.status(206).setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
            res.setHeader('Content-Length', end - start + 1);

            const stream = fs.createReadStream(assetPath, { start, end });
            stream.pipe(res).on('error', (err) => {
                console.error('Stream error:', err);
                res.status(500).end();
            });
        } else {
            res.setHeader('Content-Length', size);

            const stream = fs.createReadStream(assetPath);
            stream.pipe(res).on('error', (err) => {
                console.error('Stream error:', err);
                res.status(500).end();
            });
        }
    });
};
