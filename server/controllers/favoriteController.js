import pool from '../config/db.js';

// GET /api/favorites - Ambil semua destinasi favorit milik user yang sedang login
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT d.*, f.created_at as favorited_at
       FROM favorites f
       JOIN destinations d ON f.destination_id = d.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error getUserFavorites:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat favorit', error: error.message });
  }
};

// GET /api/favorites/ids - Ambil daftar ID destinasi favorit untuk penandaan icon heart di katalog/detail
export const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT destination_id FROM favorites WHERE user_id = ?',
      [userId]
    );

    const ids = rows.map((r) => r.destination_id);

    res.json({
      success: true,
      ids,
    });
  } catch (error) {
    console.error('Error getFavoriteIds:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat ID favorit', error: error.message });
  }
};

// POST /api/favorites/:destinationId - Toggle tambah / hapus favorit
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const destinationId = parseInt(req.params.destinationId, 10);

    if (isNaN(destinationId)) {
      return res.status(400).json({ success: false, message: 'ID destinasi tidak valid' });
    }

    // Periksa apakah destinasi ada
    const [dest] = await pool.query('SELECT id, title FROM destinations WHERE id = ?', [destinationId]);
    if (dest.length === 0) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    // Cek apakah sudah difavoritkan
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?',
      [userId, destinationId]
    );

    if (existing.length > 0) {
      // Hapus dari favorit
      await pool.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
      return res.json({
        success: true,
        isFavorited: false,
        message: `"${dest[0].title}" dihapus dari favorit Anda.`,
      });
    } else {
      // Tambah ke favorit
      await pool.query('INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)', [
        userId,
        destinationId,
      ]);
      return res.json({
        success: true,
        isFavorited: true,
        message: `"${dest[0].title}" berhasil disimpan ke favorit!`,
      });
    }
  } catch (error) {
    console.error('Error toggleFavorite:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status favorit', error: error.message });
  }
};
