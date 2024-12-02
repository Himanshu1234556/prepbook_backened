const pool = require('../config/db');

// Insert a new free resource category
exports.createCategory = async (data) => {
  const { name, description, is_active, university_ids, parent_id } = data;
  const query = `
    INSERT INTO public.free_resource_categories (name, description, is_active, university_ids, parent_id)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;
  const values = [name, description, is_active, university_ids, parent_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Fetch all free resource categories
exports.getAllCategories = async () => {
  const result = await pool.query('SELECT id, name, description, is_active, university_ids, parent_id FROM public.free_resource_categories;');
  return result.rows;
};

// Fetch a specific free resource category by ID
exports.getCategoryById = async (id) => {
  const result = await pool.query('SELECT id, name, description, is_active, university_ids, parent_id FROM public.free_resource_categories WHERE id = $1;', [id]);
  return result.rows[0];
};

// Update a free resource category
exports.updateCategory = async (id, data) => {
  const { name, description, is_active, university_ids, parent_id } = data;
  const query = `
    UPDATE public.free_resource_categories
    SET name = $1, description = $2, is_active = $3, university_ids = $4, parent_id = $5
    WHERE id = $6 RETURNING *;
  `;
  const values = [name, description, is_active, university_ids, parent_id, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete a free resource category
exports.deleteCategory = async (id) => {
  const result = await pool.query('DELETE FROM public.free_resource_categories WHERE id = $1 RETURNING *;', [id]);
  return result.rows[0];
};
