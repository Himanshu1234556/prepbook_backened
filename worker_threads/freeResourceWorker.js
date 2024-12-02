const { parentPort, workerData } = require('worker_threads');
const db = require('../config/db');

const fetchFreeResources = async (userId) => {
    const query = `
   SELECT 
    frd.id AS resource_id, 
    frd.title, 
    frd.file_path, 
    frd.file_type,
    frs.id AS subject_id, 
    frs.name AS subject_name,
    frc.id AS category_id, 
    frc.name AS category_name
FROM 
    users u
JOIN 
    free_resources_documents frd 
    ON u.university_id = (frd.university_id ->> 0)::int
JOIN 
    free_resource_categories frc 
    ON frc.university_ids @> to_jsonb(u.university_id)
JOIN 
    subjects frs 
    ON frs.id = ANY(
        SELECT jsonb_array_elements_text(frd.subject_id)::int
    )
WHERE 
    u.id = $1

`;


    const values = [userId];
    const result = await db.query(query, values);

    // Structure the free resources by categories and subjects
    const freeResourcesData = result.rows.reduce((acc, row) => {
        const categoryId = row.category_id;
        const subjectId = row.subject_id;

        if (!acc[categoryId]) {
            acc[categoryId] = {
                category_id: categoryId,
                category_name: row.category_name,
                subjects: {}
            };
        }
        if (!acc[categoryId].subjects[subjectId]) {
            acc[categoryId].subjects[subjectId] = {
                subject_id: subjectId,
                subject_name: row.subject_name,
                documents: []
            };
        }
        acc[categoryId].subjects[subjectId].documents.push({
            file_path: row.file_path,
            file_type: row.file_type
        });
        return acc;
    }, {});

    // Convert to required response format
    return Object.values(freeResourcesData).map(category => ({
        ...category,
        subjects: Object.values(category.subjects)
    }));
};

fetchFreeResources(workerData.userId).then((data) => {
    parentPort.postMessage(data);
}).catch((error) => {
    parentPort.postMessage({ error: error.message });
});
