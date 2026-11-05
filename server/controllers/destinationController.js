import pool from '../config/db.js';

// GET /api/destinations
export const getDestinations = async (req, res) => {
  try {
    const { search, category, type, featured } = req.query;

    let query = 'SELECT * FROM `destinations` WHERE 1=1';
    const params = [];

    if (featured === 'true' || featured === '1') {
      query += ' AND `is_featured` = 1';
    }

    if (type && type !== 'Semua') {
      query += ' AND `type` = ?';
      params.push(type);
    }

    if (category && category !== 'Semua') {
      query += ' AND `category` = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (`title` LIKE ? OR `location` LIKE ? OR `category` LIKE ? OR `description` LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY `id` ASC';

    const [rows] = await pool.query(query, params);

    // Format fields (facilities JSON parse if string)
    const formatted = rows.map((item) => ({
      ...item,
      rating: parseFloat(item.rating),
      isFeatured: Boolean(item.is_featured),
      facilities: typeof item.facilities === 'string' ? JSON.parse(item.facilities || '[]') : (item.facilities || []),
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('Error getDestinations:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// GET /api/destinations/:id
export const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM `destinations` WHERE `id` = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    const item = rows[0];
    const formatted = {
      ...item,
      rating: parseFloat(item.rating),
      reviewsCount: item.reviews_count,
      openHours: item.open_hours,
      isFeatured: Boolean(item.is_featured),
      facilities: typeof item.facilities === 'string' ? JSON.parse(item.facilities || '[]') : (item.facilities || []),
    };

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error getDestinationById:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// POST /api/destinations
export const createDestination = async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      rating = 4.5,
      reviewsCount = 0,
      price,
      location,
      openHours,
      image,
      description,
      facilities = [],
      isFeatured = false,
    } = req.body;

    if (!title || !type || !category || !price || !location || !description) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi semua data wajib!' });
    }

    const facilitiesJson = JSON.stringify(Array.isArray(facilities) ? facilities : []);

    const [result] = await pool.query(
      `INSERT INTO \`destinations\` 
       (\`title\`, \`type\`, \`category\`, \`rating\`, \`reviews_count\`, \`price\`, \`location\`, \`open_hours\`, \`image\`, \`description\`, \`facilities\`, \`is_featured\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        type,
        category,
        rating,
        reviewsCount,
        price,
        location,
        openHours || null,
        image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        description,
        facilitiesJson,
        isFeatured ? 1 : 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Destinasi berhasil ditambahkan',
      data: { id: result.insertId, ...req.body },
    });
  } catch (error) {
    console.error('Error createDestination:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat destinasi', error: error.message });
  }
};

// PUT /api/destinations/:id
export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      category,
      rating,
      reviewsCount,
      price,
      location,
      openHours,
      image,
      description,
      facilities,
      isFeatured,
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM `destinations` WHERE `id` = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    const current = existing[0];
    const facilitiesJson = facilities !== undefined 
      ? JSON.stringify(Array.isArray(facilities) ? facilities : []) 
      : current.facilities;

    await pool.query(
      `UPDATE \`destinations\` SET 
        \`title\` = ?, 
        \`type\` = ?, 
        \`category\` = ?, 
        \`rating\` = ?, 
        \`reviews_count\` = ?, 
        \`price\` = ?, 
        \`location\` = ?, 
        \`open_hours\` = ?, 
        \`image\` = ?, 
        \`description\` = ?, 
        \`facilities\` = ?, 
        \`is_featured\` = ? 
       WHERE \`id\` = ?`,
      [
        title ?? current.title,
        type ?? current.type,
        category ?? current.category,
        rating ?? current.rating,
        reviewsCount ?? current.reviews_count,
        price ?? current.price,
        location ?? current.location,
        openHours ?? current.open_hours,
        image ?? current.image,
        description ?? current.description,
        facilitiesJson,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : current.is_featured,
        id,
      ]
    );

    res.json({ success: true, message: 'Destinasi berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateDestination:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui destinasi', error: error.message });
  }
};

// DELETE /api/destinations/:id
export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM `destinations` WHERE `id` = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    res.json({ success: true, message: 'Destinasi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteDestination:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus destinasi', error: error.message });
  }
};
