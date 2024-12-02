const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');
const db = require('../config/db');  // Assuming you have a DB connection setup

// Function to stream and watermark the requested file
exports.streamFile = async (req, res) => {
    const { fileType, fileName } = req.params;
    const { userId } = req.user;  // Extract user ID from the JWT token
    console.log(req.user);

    // Construct the full file path based on the type (e.g., ebooks, pdf, pyq)
    const filePath = path.join(__dirname, `../files/${fileType}`, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Fetch user details from the database based on the userId from the token
    try {
        // Fetch user details from the database
        console.log('Extracted ID from token:', userId);
        const query = 'SELECT email, phone FROM users WHERE id = $1';
        const result = await db.query(query, [userId]);

        const user = result.rows[0];  // Get the user object from the query result

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle watermarking for PDF files in a separate thread
        const fileExtension = path.extname(fileName).toLowerCase();
        if (fileExtension === '.pdf') {
            // Use a worker thread to handle watermarking
            const worker = new Worker(path.join(__dirname, '../worker_threads/pdfWatermarkWorker.js'), {
                workerData: { filePath, email: user.email, phone: user.phone }
            });

            // Handle worker messages and responses
            worker.on('message', (watermarkedPdf) => {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.end(watermarkedPdf);  // Send the watermarked PDF as a response
            });

            // Handle worker errors
            worker.on('error', (error) => {
                console.error('Worker Error:', error);
                return res.status(500).json({ message: 'Error processing file' });
            });

            // Handle worker exit
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
            });
        } else {
            // For non-PDF files, stream them directly without modification
            const stream = fs.createReadStream(filePath);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            stream.pipe(res);
        }
    } catch (error) {
        console.error('Error fetching user or processing file:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
