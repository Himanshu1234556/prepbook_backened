const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');
const { PDFDocument, rgb } = require('pdf-lib');

(async () => {
    const { filePath, email, phone } = workerData;

    try {
        console.log('Reading file from:', filePath);
        const existingPdfBytes = fs.readFileSync(filePath);

        // Check if the file buffer is not empty
        if (existingPdfBytes.length === 0) {
            console.error('Error: PDF is empty');
            parentPort.postMessage({ error: 'PDF is empty' });
            return;
        }

        // Log the first few bytes of the PDF (to verify it’s a valid PDF)
        console.log('First 20 bytes of PDF:', existingPdfBytes.slice(0, 20));

        // Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });

        // Process the first page and add watermark
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        firstPage.drawText(`User: ${email} - ${phone}`, {
            x: 50,
            y: 50,
            size: 12,
            color: rgb(0.95, 0.1, 0.1),
        });

        // Serialize and return the watermarked PDF
        const watermarkedPdfBytes = await pdfDoc.save();
        parentPort.postMessage(watermarkedPdfBytes);
    } catch (error) {
        console.error('Error processing PDF:', error.message);
        parentPort.postMessage({ error: error.message });
    }
})();
