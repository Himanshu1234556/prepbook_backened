const pool = require("../../config/db");

class Subject {
  static async getSubjectsWithDocuments() {
    const query = `
     WITH subject_docs AS (
    SELECT 
        s.id AS subject_id, 
        s.name AS subject_name,
        COALESCE(json_agg(d.title) FILTER (WHERE d.title IS NOT NULL), '[]'::json) AS document_names,
        COALESCE(fc.name, 'No Category') AS category_name
    FROM subjects s
    LEFT JOIN LATERAL (
        SELECT d.title, sub_id::int AS subject_id, d.category_id 
        FROM free_resources_documents d, 
             jsonb_array_elements_text(d.subject_id) AS sub_id
    ) d ON s.id = d.subject_id
    LEFT JOIN free_resource_categories fc ON d.category_id = fc.id
    GROUP BY s.id, s.name, fc.name
)
SELECT 
    subject_id, subject_name, 
    CASE 
        WHEN jsonb_array_length(document_names::jsonb) = 0 THEN 'no_documents'
        ELSE 'has_documents' 
    END AS doc_status,
    document_names,
    category_name
FROM subject_docs;

;
    `;

    const { rows } = await pool.query(query);
    return rows;
  }
}

module.exports = Subject;
