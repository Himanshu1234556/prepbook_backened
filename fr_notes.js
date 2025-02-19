const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || '185.193.19.48',
    port: process.env.DB_PORT || 5434,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'Him123@#$',
    database: process.env.DB_NAME || 'prepbook'
});

const notesFolder = 'files/unit_m'; // Folder for handwritten notes

async function processNotes() {
    try {
        const files = fs.readdirSync(notesFolder);
        const filePromises = files.map(async (file) => {
            try {
                const trimmedFile = file.trim();
                
                // Extract subjectId and unitNumber ensuring spaces are handled properly
                const match = trimmedFile.match(/^(\d+)\s*&\s*(\d+-?\d*)/);
                
                if (!match) {
                    console.error(`Skipping invalid file: ${file}`);
                    return;
                }

                const subjectId = parseInt(match[1]);
                const unitNumber = match[2]; // Capture full unit number including hyphen

                if (isNaN(subjectId) || !unitNumber) {
                    console.error(`Invalid subject or unit number in file: ${file}`);
                    return;
                }

                // Fetch subject name from database
                const { rows } = await pool.query('SELECT name FROM subjects WHERE id = $1', [subjectId]);

                if (rows.length === 0) {
                    console.error(`No subject found for ID: ${subjectId}, skipping file: ${file}`);
                    return;
                }

                const subjectName = rows[0].name;
                const title = unitNumber === '0' ? 'PPT Notes' : `Unit ${unitNumber} PPT Notes`;
                const filePath = path.join(notesFolder, file);
                const fileType = 'pdf';

                // Insert into free_resources_documents table
                const insertQuery = `
                    INSERT INTO free_resources_documents 
                    (category_id, title, description, file_path, file_type, subject_id, university_id, uploaded_at, updated_at, is_active) 
                    VALUES 
                    ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, NOW(), NOW(), $8)
                `;

                await pool.query(insertQuery, [
                    21,
                    title,
                    subjectName,
                    filePath,
                    fileType,
                    JSON.stringify([subjectId]), // Properly format JSONB
                    JSON.stringify([1]), // Properly format JSONB
                    true
                ]);

                console.log(`Inserted: ${file}`);
            } catch (err) {
                console.error(`Error processing file ${file}:`, err);
            }
        });

        await Promise.all(filePromises);
        console.log(`All handwritten notes processed.`);
    } catch (error) {
        console.error(`Error reading folder ${notesFolder}:`, error);
    }
}

// Process only handwritten notes
processNotes();
