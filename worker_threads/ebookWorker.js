const { parentPort, workerData } = require('worker_threads');
const db = require('../config/db');

const fetchEbooks = async (userId) => {
    const query = `
      SELECT e.id AS ebook_id, e.title, e.author, e.publication_date, e.language, e.file_path, e.file_type, 
       s.id AS subject_id, s.name AS subject_name
FROM ebooks e
JOIN subjects s ON (e.subject_id = s.id)
JOIN users u 
  ON (e.branch_id @> to_jsonb(u.branch_id))
  AND (e.university_id @> to_jsonb(u.university_id))
WHERE u.id = $1;
`;


    const values = [userId];
    const result = await db.query(query, values);

    // Structure the ebooks by subjects
    const ebookData = result.rows.reduce((acc, row) => {
        const subjectId = row.subject_id;
        if (!acc[subjectId]) {
            acc[subjectId] = {
                subject_id: subjectId,
                subject_name: row.subject_name,
                author: row.author,
                publication_date: row.publication_date,
                language: row.language,
                documents: []
            };
        }
        acc[subjectId].documents.push({
            file_path: row.file_path,
            file_type: row.file_type
        });
        return acc;
    }, {});

    return Object.values(ebookData); // Return array of ebooks grouped by subject
};

fetchEbooks(workerData.userId).then((data) => {
    parentPort.postMessage(data);
}).catch((error) => {
    parentPort.postMessage({ error: error.message });
});
