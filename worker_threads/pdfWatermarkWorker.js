const fs = require('fs');
const path = require('path');
const { parentPort, workerData } = require('worker_threads');
const { PDFDocument, rgb } = require('pdf-lib');
const { sendWhatsAppMessage } = require("../helpers/otpHelper.js");

const DEFAULT_PDF_PATH = './files/error/default.pdf'; // Default PDF file path
const PROMO_PDF_PATH = './files/error/promo.pdf'; // Promo PDF file path
const ENABLE_WATERMARK = true; // Toggle watermarking

(async () => {
    const { filePath, email, phone } = workerData;
    let issueMessage = null; // Store error message for WhatsApp reporting
    const fileName = path.basename(filePath); // Extract filename from path

    try {
        console.log('Reading file from:', filePath);
        let existingPdfBytes;

        try {
            existingPdfBytes = fs.readFileSync(filePath);
            if (!existingPdfBytes || existingPdfBytes.length === 0) {
                issueMessage = "PDF file is empty.";
                throw new Error(issueMessage);
            }
        } catch (err) {
            issueMessage = "File not found or cannot be read.";
            console.error('Error reading PDF file:', err.message);
            parentPort.postMessage(fs.readFileSync(DEFAULT_PDF_PATH));
            return;
        }

        if (!ENABLE_WATERMARK) {
            console.log('Watermarking is disabled. Streaming original PDF with promo.');
            const finalPdfBytes = await appendPromoPdf(existingPdfBytes);
            parentPort.postMessage(finalPdfBytes);
            return;
        }

        if (existingPdfBytes.includes(Buffer.from('/Encrypt'))) {
            issueMessage = "PDF is encrypted. Cannot modify.";
            console.warn(issueMessage);
            parentPort.postMessage(existingPdfBytes);
            return;
        }

        let pdfDoc;
        try {
            pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        } catch (err) {
            issueMessage = "Corrupted or invalid PDF format.";
            console.error('Error loading PDF:', err.message);
            parentPort.postMessage(fs.readFileSync(DEFAULT_PDF_PATH));
            return;
        }

        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            issueMessage = "No pages found in the PDF.";
            console.warn(issueMessage);
            parentPort.postMessage(fs.readFileSync(DEFAULT_PDF_PATH));
            return;
        }

        const firstPage = pages[0];
        if (firstPage.getTextContent) {
            const textContent = await firstPage.getTextContent();
            if (textContent.items.length === 0) {
                issueMessage = "Scanned PDF detected. Returning as is.";
                console.warn(issueMessage);
                parentPort.postMessage(existingPdfBytes);
                return;
            }
        }

        // Adding watermark
        firstPage.drawText(`User: ${email} - ${phone}`, {
            x: 50,
            y: 50,
            size: 12,
            color: rgb(0.95, 0.1, 0.1),
        });

        const watermarkedPdfBytes = await pdfDoc.save();
        const finalPdfBytes = await appendPromoPdf(watermarkedPdfBytes);
        parentPort.postMessage(finalPdfBytes);
    } catch (error) {
        console.error('Unexpected Error:', error.message);
        issueMessage = issueMessage || "Unexpected processing error.";
        parentPort.postMessage(fs.readFileSync(DEFAULT_PDF_PATH));
    }

    // Send WhatsApp notification only if an issue occurred
    if (issueMessage) {
        sendWhatsAppMessage("8630171310", "bug_report", [
            `User : ${phone}`,
            `📂 **File Path:** ${filePath}`,
            `⚠️ **Issue:** ${issueMessage}`
        ])
        .then(response => console.log("WhatsApp alert sent successfully:", response))
        .catch(error => console.error("Failed to send WhatsApp alert:", error));
    }
})();

async function appendPromoPdf(pdfBytes) {
    try {
        const mainPdf = await PDFDocument.load(pdfBytes);
        const promoPdfBytes = fs.readFileSync(PROMO_PDF_PATH);
        const promoPdf = await PDFDocument.load(promoPdfBytes);

        const mergedPdf = await PDFDocument.create();
        const mainPages = await mergedPdf.copyPages(mainPdf, mainPdf.getPageIndices());
        mainPages.forEach(page => mergedPdf.addPage(page));

        const promoPages = await mergedPdf.copyPages(promoPdf, promoPdf.getPageIndices());
        promoPages.forEach(page => mergedPdf.addPage(page));

        return await mergedPdf.save();
    } catch (error) {
        console.error("Error appending promo PDF:", error.message);
        return pdfBytes; // Return original if promo append fails
    }
}
