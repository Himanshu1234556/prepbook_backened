const express = require('express');
const router = express.Router();
const freeResourceCategoryController = require('../controllers/freeResourceCategoryController');

// Create a new category
router.post('/', freeResourceCategoryController.createCategory);

// Fetch all categories
router.get('/', freeResourceCategoryController.getAllCategories);

// Fetch a category by ID
router.get('/:id', freeResourceCategoryController.getCategoryById);

// Update a category
router.put('/:id', freeResourceCategoryController.updateCategory);

// Delete a category
router.delete('/:id', freeResourceCategoryController.deleteCategory);

module.exports = router;
