const fs = require('fs');
const path = require('path');
const rangeParser = require('range-parser');

const videoFolder = '/var/www/api37/videos/local_folder';
const supportedExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm'];

exports.streamVideo = (req, res) => {
  try {
    const videoName = req.params.videoName;
    
    // Find the correct video file
    let videoPath = null;
    let videoExt = null;
    for (const ext of supportedExtensions) {
      const fullPath = path.join(videoFolder, videoName + ext);
      if (fs.existsSync(fullPath)) {
        videoPath = fullPath;
        videoExt = ext;
        break;
      }
    }

    if (!videoPath) {
      return res.status(404).json({ error: 'Video not found' });
    }

    fs.stat(videoPath, (err, stats) => {
      if (err || !stats.isFile()) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const videoSize = stats.size;
      const range = req.headers.range;

      if (!range) {
        return res.status(200).sendFile(videoPath);
      }

      const rangeResults = rangeParser(videoSize, range);

      if (rangeResults === -1 || rangeResults === -2) {
        return res.status(416).json({ error: 'Requested Range Not Satisfiable' });
      }

      const [chunk] = rangeResults;
      let start = chunk.start;
      let end = chunk.end || videoSize - 1;

      // Limit chunk size to prevent excessive memory usage (Max: 10MB)
      const MAX_CHUNK_SIZE = 10 * 1024 * 1024;
      if (end - start > MAX_CHUNK_SIZE) {
        end = start + MAX_CHUNK_SIZE - 1;
      }

      const videoStream = fs.createReadStream(videoPath, { start, end });

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': getMimeType(videoExt),
      });

      videoStream.pipe(res);

      videoStream.on('error', (error) => {
        console.error('Stream error:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to get the correct MIME type
function getMimeType(ext) {
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
