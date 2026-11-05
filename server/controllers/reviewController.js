import pool from '../config/db.js';

// GET /api/destinations/:id/reviews
export const getReviewsByDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT r.id, r.destination_id, r.user_id, r.rating, r.comment, r.photo_url, r.created_at,
              u.name as user_name, u.role as user_role, u.avatar as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.destination_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error getReviewsByDestination:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ulasan', error: error.message });
  }
};

// POST /api/destinations/:id/reviews
export const createReview = async (req, res) => {
  try {
    const destinationId = req.params.id;
    const userId = req.user.id;
    const { rating, comment, photo_url } = req.body;

    if (!rating || !comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Bintang penilaian (rating 1-5) dan komentar ulasan wajib diisi!',
      });
    }

    const ratingNum = Math.min(5, Math.max(1, parseInt(rating, 10)));
    const cleanPhotoUrl = photo_url && photo_url.trim() !== '' ? photo_url.trim() : null;

    // Simpan ulasan ke tabel reviews
    const [insertResult] = await pool.query(
      'INSERT INTO reviews (destination_id, user_id, rating, comment, photo_url) VALUES (?, ?, ?, ?, ?)',
      [destinationId, userId, ratingNum, comment.trim(), cleanPhotoUrl]
    );

    // Hitung ulang rating rata-rata dan total ulasan di destinasi
    const [stats] = await pool.query(
      'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM reviews WHERE destination_id = ?',
      [destinationId]
    );

    const newReviewsCount = stats[0].total_reviews;
    const newAvgRating = parseFloat(stats[0].avg_rating).toFixed(1);

    await pool.query(
      'UPDATE destinations SET rating = ?, reviews_count = ? WHERE id = ?',
      [newAvgRating, newReviewsCount, destinationId]
    );

    // Ambil data ulasan yang baru saja disimpan beserta info user
    const [newReview] = await pool.query(
      `SELECT r.id, r.destination_id, r.user_id, r.rating, r.comment, r.photo_url, r.created_at,
              u.name as user_name, u.role as user_role, u.avatar as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Ulasan Anda berhasil dikirim!',
      data: newReview[0],
      updatedStats: {
        rating: newAvgRating,
        reviewsCount: newReviewsCount,
      },
    });
  } catch (error) {
    console.error('Error createReview:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim ulasan', error: error.message });
  }
};

// GET /api/reviews - Ambil semua ulasan (untuk manajemen ulasan admin)
export const getAllReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.destination_id, r.user_id, r.rating, r.comment, r.photo_url, r.created_at,
              u.name as user_name, u.email as user_email, u.role as user_role,
              d.title as destination_title, d.type as destination_type
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN destinations d ON r.destination_id = d.id
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error getAllReviews:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat semua ulasan', error: error.message });
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [review] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);

    if (review.length === 0) {
      return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan' });
    }

    // Hanya pembuat ulasan atau Admin yang boleh menghapus
    if (review[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak menghapus ulasan ini' });
    }

    const destinationId = review[0].destination_id;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

    // Recalculate destination stats
    const [stats] = await pool.query(
      'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM reviews WHERE destination_id = ?',
      [destinationId]
    );

    const newReviewsCount = stats[0].total_reviews;
    const newAvgRating = newReviewsCount > 0 ? parseFloat(stats[0].avg_rating).toFixed(1) : 4.5;

    await pool.query(
      'UPDATE destinations SET rating = ?, reviews_count = ? WHERE id = ?',
      [newAvgRating, newReviewsCount, destinationId]
    );

    res.json({ success: true, message: 'Ulasan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteReview:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus ulasan', error: error.message });
  }
};
