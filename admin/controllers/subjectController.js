const Subject = require("../models/subject");

const getSubjectsDocumentsStatus = async (req, res) => {
  try {
    const subjects = await Subject.getSubjectsWithDocuments();

    // Grouping subjects into two categories: subjects with documents and subjects without documents
    const result = {
      subjectsWithoutDocuments: subjects
        .filter(row => row.doc_status === "no_documents")
        .map(row => ({
          id: row.subject_id,
          name: row.subject_name,
        })),
      subjectsWithDocuments: subjects
        .filter(row => row.doc_status === "has_documents")
        .map(row => ({
          id: row.subject_id,
          name: row.subject_name,
          documentsByCategory: row.documents_by_category || {} // Group documents by category
        }))
    };

    // Responding with the structured result
    res.json(result);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getSubjectsDocumentsStatus };
