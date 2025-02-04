const express = require('express');
const router = express.Router();
const freeResourceCategoryController = require('../controllers/freeResourceCategoryController');

router.get('/', freeResourceCategoryController.getAllCategories);
router.get('/:id', freeResourceCategoryController.getCategoryById);
router.post('/', freeResourceCategoryController.createCategory);
router.put('/:id', freeResourceCategoryController.updateCategory);
router.delete('/:id', freeResourceCategoryController.deleteCategory);

module.exports = router;
