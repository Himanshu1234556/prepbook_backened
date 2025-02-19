const express = require("express");
const { getSubjectsDocumentsStatus } = require("../controllers/subjectController");

const router = express.Router();

// Route to get subjects with/without documents
router.get("/documents-status", getSubjectsDocumentsStatus);

module.exports = router;
