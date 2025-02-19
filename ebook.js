const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '185.193.19.48',
    port: process.env.DB_PORT || 5434,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'Him123@#$',
    database: process.env.DB_NAME || 'prepbook'
});

const ebooksDir = './files/ebooks'; // Folder path
const logFilePath = './skipped_files.txt'; // Log file for skipped files

async function insertEbooks() {
    try {
        const files = fs.readdirSync(ebooksDir);
        
        for (const file of files) {
            try {
                // Check if the file is not a PDF
                if (!file.endsWith('.pdf')) {
                    fs.appendFileSync(logFilePath, `Skipped (Invalid Format): ${file}\n`);
                    console.warn(`Skipped: ${file} (Invalid Format)`);
                    continue;
                }

                const cleanFileName = file.replace(/\s+/g, ' '); // Normalize spaces
                const subjectIdMatch = cleanFileName.match(/^\d+/);
                if (!subjectIdMatch) {
                    fs.appendFileSync(logFilePath, `Skipped (No Subject ID): ${file}\n`);
                    console.warn(`Skipping file: ${file} - No valid subject ID found`);
                    continue;
                }

                const subjectId = parseInt(subjectIdMatch[0]);
                let title = "Mentor Series Ques Bank";
                const unitMatch = cleanFileName.match(/&(\s?\d+|0m)/i);

                if (unitMatch) {
                    const unit = unitMatch[1].trim();
                    title = unit === "0m" ? "Complete Notes" : `Unit ${unit} Notes`;
                }

                const description = "Complete Question Bank For AKTU Students Semester Exam Prep";
                const universityId = JSON.stringify([1]);
                const branchId = JSON.stringify([19]);
                const author = "Mentor Series";
                const publicationDate = `2025-01-${String(Math.floor(Math.random() * 31) + 1).padStart(2, '0')}`;
                const language = "ENGLISH";
                const filePath = `files/ebooks/${file}`;
                const fileType = "PDF";
                const isActive = true;

                const query = `
                    INSERT INTO public.ebooks (
                        title, description, subject_id, university_id, branch_id, 
                        author, publication_date, language, file_path, file_type, is_active
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;

                const values = [
                    title, description, subjectId, universityId, branchId, 
                    author, publicationDate, language, filePath, fileType, isActive
                ];

                await pool.query(query, values);
                console.log(`Inserted: ${file} as "${title}"`);
            } catch (err) {
                fs.appendFileSync(logFilePath, `Error Processing: ${file} - ${err.message}\n`);
                console.error(`Error processing file: ${file}`, err);
            }
        }
    } catch (err) {
        console.error('Error reading ebook directory:', err);
    } finally {
        await pool.end();
    }
}

insertEbooks();
