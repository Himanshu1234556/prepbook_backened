const pool = require('../../config/db');

class FreeResourceCategory {
    static async getAll() {
        const { rows } = await pool.query('SELECT * FROM public.free_resource_categories');
        return rows;
    }

    static async getById(id) {
        const { rows } = await pool.query('SELECT * FROM public.free_resource_categories WHERE id = $1', [id]);
        return rows[0];
    }

    static async create({ name, description, is_active, university_ids, parent_id, icon_url }) {
        // Ensure icon_url is NULL if it is empty or undefined
       // const finalIconUrl = icon_url && icon_url.trim() !== "" ? icon_url : null;
       const finalIconUrl = null;
    
        const { rows } = await pool.query(
            `INSERT INTO public.free_resource_categories 
            (name, description, is_active, university_ids, parent_id, icon_url, created_at, updated_at) 
            VALUES ($1, $2, $3, $4::jsonb, $5, $6, NOW(), NOW()) RETURNING *`,
            [name, description, is_active, JSON.stringify(university_ids), parent_id, finalIconUrl]
        );
    
        return rows[0];
    }
    
    
    

    static async update(id, { name, description, is_active, university_ids, parent_id, icon_url }) {
        const { rows } = await pool.query(
            `UPDATE public.free_resource_categories 
            SET name = $1, description = $2, is_active = $3, university_ids = $4::jsonb, 
                parent_id = $5, icon_url = $6, updated_at = NOW() 
            WHERE id = $7 RETURNING *`,
            [name, description, is_active, JSON.stringify(university_ids), parent_id, icon_url, id]
        );
        return rows[0];
    }
    
    static async delete(id) {
        const { rows } = await pool.query(
            'DELETE FROM public.free_resource_categories WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0];
    }
}

module.exports = FreeResourceCategory;
