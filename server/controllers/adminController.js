import pool from '../config/db.js';

// GET /api/admin/stats (Admin Only)
export const getAdminStats = async (req, res) => {
  try {
    const [destTotal] = await pool.query('SELECT COUNT(*) as count FROM destinations');
    const [wisataTotal] = await pool.query('SELECT COUNT(*) as count FROM destinations WHERE type = "Wisata"');
    const [kulinerTotal] = await pool.query('SELECT COUNT(*) as count FROM destinations WHERE type = "Kuliner"');
    const [usersTotal] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [reviewsTotal] = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const [favoritesTotal] = await pool.query('SELECT COUNT(*) as count FROM favorites');

    const [recentReviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.photo_url, r.created_at, u.name as user_name, d.title as destination_title
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN destinations d ON r.destination_id = d.id
       ORDER BY r.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalDestinations: destTotal[0].count,
        totalWisata: wisataTotal[0].count,
        totalKuliner: kulinerTotal[0].count,
        totalUsers: usersTotal[0].count,
        totalReviews: reviewsTotal[0].count,
        totalFavorites: favoritesTotal[0].count,
      },
      recentReviews,
    });
  } catch (error) {
    console.error('Error getAdminStats:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik admin', error: error.message });
  }
};

// Helper untuk format cell CSV dengan penanganan koma dan quotes
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

// GET /api/admin/export/destinations (Admin Only)
export const exportDestinationsCSV = async (req, res) => {
  try {
    const [destinations] = await pool.query(
      `SELECT d.id, d.title, d.type, d.category, d.price, d.rating, d.reviews_count,
              d.location, d.latitude, d.longitude, d.open_hours, d.created_at
       FROM destinations d
       ORDER BY d.id ASC`
    );

    const headers = [
      'ID',
      'Nama Destinasi',
      'Tipe',
      'Kategori',
      'Harga / Tiket',
      'Rating',
      'Jumlah Ulasan',
      'Lokasi / Alamat',
      'Latitude',
      'Longitude',
      'Jam Buka',
      'Tanggal Dibuat',
    ];

    const rows = destinations.map((d) => [
      escapeCSV(d.id),
      escapeCSV(d.title),
      escapeCSV(d.type),
      escapeCSV(d.category),
      escapeCSV(d.price),
      escapeCSV(d.rating),
      escapeCSV(d.reviews_count),
      escapeCSV(d.location),
      escapeCSV(d.latitude),
      escapeCSV(d.longitude),
      escapeCSV(d.open_hours),
      escapeCSV(d.created_at),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `destinataste_destinasi_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exportDestinationsCSV:', error);
    res.status(500).json({ success: false, message: 'Gagal ekspor data destinasi', error: error.message });
  }
};

// GET /api/admin/export/reviews (Admin Only)
export const exportReviewsCSV = async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, d.title as destination_title, d.type as destination_type,
              u.name as user_name, u.email as user_email, u.role as user_role,
              r.rating, r.comment, r.photo_url, r.created_at
       FROM reviews r
       JOIN destinations d ON r.destination_id = d.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );

    const headers = [
      'ID Ulasan',
      'Nama Destinasi',
      'Tipe Destinasi',
      'Nama Pengguna',
      'Email Pengguna',
      'Role Pengguna',
      'Rating',
      'Komentar Ulasan',
      'Foto Lampiran',
      'Waktu Kirim',
    ];

    const rows = reviews.map((r) => [
      escapeCSV(r.id),
      escapeCSV(r.destination_title),
      escapeCSV(r.destination_type),
      escapeCSV(r.user_name),
      escapeCSV(r.user_email),
      escapeCSV(r.user_role),
      escapeCSV(r.rating),
      escapeCSV(r.comment),
      escapeCSV(r.photo_url || '-'),
      escapeCSV(r.created_at),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `destinataste_ulasan_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exportReviewsCSV:', error);
    res.status(500).json({ success: false, message: 'Gagal ekspor data ulasan', error: error.message });
  }
};
