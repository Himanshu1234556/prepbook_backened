const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');
const { PDFDocument, rgb } = require('pdf-lib');

(async () => {
    const { filePath, email, phone } = workerData;

    try {
        // Read the original PDF
        const existingPdfBytes = fs.readFileSync(filePath);

        // Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Add watermark (phone and email) to the first page
        firstPage.drawText(`User: ${email} - ${phone}`, {
            x: 50,
            y: 50,
            size: 12,
            color: rgb(0.95, 0.1, 0.1),
        });

        // Serialize the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();

        // Send the watermarked PDF bytes back to the main thread
        parentPort.postMessage(pdfBytes);
    } catch (error) {
        // Handle error and stop the worker
        console.error('Error processing PDF in worker:', error);
        parentPort.close();
    }
})();
