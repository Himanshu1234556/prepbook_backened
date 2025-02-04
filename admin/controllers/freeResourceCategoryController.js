const FreeResourceCategory = require('../models/freeResourceCategory');

const standardResponse = (res, status, success, message, data = null, error = null) => {
    return res.status(status).json({ success, message, data, error });
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await FreeResourceCategory.getAll();
        return standardResponse(res, 200, true, 'Categories fetched successfully', categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return standardResponse(res, 500, false, 'Failed to fetch categories', null, error.message);
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await FreeResourceCategory.getById(id);
        if (!category) return standardResponse(res, 404, false, 'Category not found');
        return standardResponse(res, 200, true, 'Category fetched successfully', category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return standardResponse(res, 500, false, 'Failed to fetch category', null, error.message);
    }
};

const createCategory = async (req, res) => {
    try {
        console.log("Received request to create category:", req.body);

        const category = await FreeResourceCategory.create(req.body);
        
        console.log("Category created successfully:", category);
        return standardResponse(res, 201, true, 'Category created successfully', category);
    } catch (error) {
        console.error("Error creating category:", error);
        return standardResponse(res, 500, false, 'Failed to create category', null, error.message);
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = await FreeResourceCategory.update(id, req.body);
        if (!updatedCategory) return standardResponse(res, 404, false, 'Category not found');
        return standardResponse(res, 200, true, 'Category updated successfully', updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        return standardResponse(res, 500, false, 'Failed to update category', null, error.message);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await FreeResourceCategory.delete(id);
        if (!deletedCategory) return standardResponse(res, 404, false, 'Category not found');
        return standardResponse(res, 200, true, 'Category deleted successfully');
    } catch (error) {
        console.error("Error deleting category:", error);
        return standardResponse(res, 500, false, 'Failed to delete category', null, error.message);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
