const { parentPort, workerData } = require('worker_threads');
const db = require('../config/db');

const fetchFreeResources = async (userId) => {
    // Fetch categories with parent-child relationships
    const categoryQuery = `
        SELECT 
            id AS category_id,
            name AS category_name,
            parent_id
        FROM 
            free_resource_categories
        WHERE 
            is_active = true
    `;
    const categoriesResult = await db.query(categoryQuery);

    // Fetch free resources associated with the user
    const resourceQuery = `
        SELECT 
            frd.id AS resource_id, 
            frd.title, 
            frd.file_path, 
            frd.file_type,
            frs.id AS subject_id, 
            frs.name AS subject_name,
            frc.id AS category_id
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
    const resourceValues = [userId];
    const resourcesResult = await db.query(resourceQuery, resourceValues);

    // Create a map of categories by ID
    const categoryMap = {};
    categoriesResult.rows.forEach(category => {
        categoryMap[category.category_id] = {
            category_id: category.category_id,
            category_name: category.category_name,
            parent_id: category.parent_id,
            subcategories: [],
            subjects: [],
            files: []
        };
    });

    // Associate files and subjects with categories
    resourcesResult.rows.forEach(row => {
        const category = categoryMap[row.category_id];
        if (category) {
            // Add subject if not already present
            let subject = category.subjects.find(s => s.subject_id === row.subject_id);
            if (!subject) {
                subject = {
                    subject_id: row.subject_id,
                    subject_name: row.subject_name,
                    documents: []
                };
                category.subjects.push(subject);
            }

            // Add document to the subject
            subject.documents.push({
                resource_id: row.resource_id,
                title: row.title,
                file_path: row.file_path,
                file_type: row.file_type
            });
        }
    });

    // Build the category hierarchy
    Object.values(categoryMap).forEach(category => {
        if (category.parent_id && categoryMap[category.parent_id]) {
            categoryMap[category.parent_id].subcategories.push(category);
        }
    });

    // Convert categories to response format
    const buildHierarchy = (category) => ({
        category_id: category.category_id,
        category_name: category.category_name,
        subcategories: category.subcategories.map(buildHierarchy),
        subjects: category.subjects,
        files: category.files
    });

    // Return only top-level categories
    return Object.values(categoryMap)
        .filter(category => !category.parent_id)
        .map(buildHierarchy);
};

// Execute the worker function
fetchFreeResources(workerData.userId).then((data) => {
    parentPort.postMessage(data);
}).catch((error) => {
    parentPort.postMessage({ error: error.message });
});
