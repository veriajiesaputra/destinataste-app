import pool from '../config/db.js';

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    let query = 'SELECT * FROM `categories`';
    const params = [];

    if (type && type !== 'Semua') {
      query += ' WHERE `type` = ?';
      params.push(type);
    }

    query += ' ORDER BY `id` ASC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error getCategories:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori', error: error.message });
  }
};
