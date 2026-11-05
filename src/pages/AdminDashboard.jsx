import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUploadInput from '../components/ImageUploadInput';
import {
  fetchAdminStats,
  fetchDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  fetchCategories,
  fetchAllReviewsAdmin,
  deleteReview,
  downloadDestinationsCSV,
  downloadReviewsCSV,
  fetchAllUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
} from '../services/api';

export default function AdminDashboard() {
  const { user, token, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'reviews'
  const [stats, setStats] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Destinasi
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Semua');

  // Filter Ulasan
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('Semua');

  // Filter & State Kelola Pengguna
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('Semua');

  // Modal Pengguna State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserEditMode, setIsUserEditMode] = useState(false);
  const [userEditId, setUserEditId] = useState(null);
  const initialUserForm = {
    name: '',
    email: '',
    role: 'pengguna',
    password: '',
    avatar: '',
  };
  const [userFormData, setUserFormData] = useState(initialUserForm);
  const [userSubmitError, setUserSubmitError] = useState('');
  const [userSubmitLoading, setUserSubmitLoading] = useState(false);

  // Modal Destinasi State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Lightbox Foto Ulasan
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Export Loading States
  const [exportingDest, setExportingDest] = useState(false);
  const [exportingRev, setExportingRev] = useState(false);

  // Form State Destinasi
  const initialForm = {
    title: '',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.8,
    price: 'Rp 15.000 / orang',
    location: '',
    openHours: '08.00 - 17.00 WIB',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: '',
    facilities: '',
    isFeatured: false,
    latitude: -6.87,
    longitude: 109.13,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Ambil Data Stats, Destinasi, Ulasan, dan Pengguna
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, destData, catData, revData, usersData] = await Promise.all([
        fetchAdminStats(token),
        fetchDestinations(),
        fetchCategories(),
        fetchAllReviewsAdmin(token),
        fetchAllUsers(token),
      ]);
      setStats(statsData.stats);
      setDestinations(destData);
      setCategories(catData);
      setReviews(revData);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Gagal memuat data admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      loadData();
    }
  }, [isAdmin, token]);

  // Handle Ekspor Destinasi CSV
  const handleExportDestinations = async () => {
    try {
      setExportingDest(true);
      await downloadDestinationsCSV(token);
    } catch (err) {
      alert('Gagal mengekspor data destinasi: ' + err.message);
    } finally {
      setExportingDest(false);
    }
  };

  // Handle Ekspor Ulasan CSV
  const handleExportReviews = async () => {
    try {
      setExportingRev(true);
      await downloadReviewsCSV(token);
    } catch (err) {
      alert('Gagal mengekspor data ulasan: ' + err.message);
    } finally {
      setExportingRev(false);
    }
  };

  // Handle Hapus Ulasan dari Tabel Moderasi
  const handleDeleteReviewItem = async (reviewId, reviewerName) => {
    if (window.confirm(`Yakin ingin menghapus ulasan dari "${reviewerName}"?`)) {
      try {
        await deleteReview(reviewId, token);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        // Update stats ulasan
        if (stats) {
          setStats((prev) => ({ ...prev, totalReviews: Math.max(0, prev.totalReviews - 1) }));
        }
      } catch (err) {
        alert('Gagal menghapus ulasan: ' + err.message);
      }
    }
  };

  // Handle Buka Modal Tambah Destinasi
  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditMode(false);
    setEditId(null);
    setSubmitError('');
    setIsModalOpen(true);
  };

  // Handle Buka Modal Edit Destinasi
  const handleOpenEdit = (item) => {
    setFormData({
      title: item.title,
      type: item.type,
      category: item.category,
      rating: item.rating,
      price: item.price,
      location: item.location,
      openHours: item.open_hours || item.openHours || '',
      image: item.image,
      description: item.description,
      facilities: Array.isArray(item.facilities) ? item.facilities.join(', ') : '',
      isFeatured: Boolean(item.isFeatured || item.is_featured),
      latitude: item.latitude || -6.87,
      longitude: item.longitude || 109.13,
    });
    setIsEditMode(true);
    setEditId(item.id);
    setSubmitError('');
    setIsModalOpen(true);
  };

  // Handle Submit Form (Tambah / Edit)
  const handleSubmitDestination = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        category: formData.category,
        rating: parseFloat(formData.rating),
        price: formData.price,
        location: formData.location,
        openHours: formData.openHours,
        image: formData.image,
        description: formData.description,
        facilities: formData.facilities.split(',').map((f) => f.trim()).filter(Boolean),
        isFeatured: formData.isFeatured,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
      };

      if (isEditMode) {
        await updateDestination(editId, payload, token);
      } else {
        await createDestination(payload, token);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setSubmitError(err.message || 'Gagal menyimpan destinasi');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Hapus Destinasi
  const handleDeleteDestination = async (id, title) => {
    if (window.confirm(`Yakin ingin menghapus destinasi "${title}"? Data ulasan dan favorit terkait juga akan dihapus.`)) {
      try {
        await deleteDestination(id, token);
        await loadData();
      } catch (err) {
        alert(err.message || 'Gagal menghapus destinasi');
      }
    }
  };

  // Filtered Destinasi List
  const filteredDestinations = destinations.filter((item) => {
    const matchType = selectedType === 'Semua' || item.type === selectedType;
    const matchSearch =
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Filtered Ulasan List
  const filteredReviews = reviews.filter((rev) => {
    const matchRating =
      reviewRatingFilter === 'Semua' || rev.rating === parseInt(reviewRatingFilter, 10);
    const matchSearch =
      (rev.destination_title || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
      (rev.user_name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
      (rev.comment || '').toLowerCase().includes(reviewSearch.toLowerCase());
    return matchRating && matchSearch;
  });

  // =================== HANDLERS PENGGUNA (USERS) ===================
  const handleOpenAddUser = () => {
    setUserFormData(initialUserForm);
    setIsUserEditMode(false);
    setUserEditId(null);
    setUserSubmitError('');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (item) => {
    setUserFormData({
      name: item.name,
      email: item.email,
      role: item.role || 'pengguna',
      password: '',
      avatar: item.avatar || '',
    });
    setIsUserEditMode(true);
    setUserEditId(item.id);
    setUserSubmitError('');
    setIsUserModalOpen(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setUserSubmitError('');
    setUserSubmitLoading(true);

    try {
      if (isUserEditMode) {
        await updateUserAdmin(userEditId, userFormData, token);
      } else {
        if (!userFormData.password || userFormData.password.length < 6) {
          throw new Error('Kata sandi wajib diisi dan minimal 6 karakter!');
        }
        await createUserAdmin(userFormData, token);
      }

      setIsUserModalOpen(false);
      await loadData();
    } catch (err) {
      setUserSubmitError(err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setUserSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === user?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login!');
      return;
    }
    if (
      window.confirm(
        `Yakin ingin menghapus akun pengguna "${name}"? Seluruh riwayat ulasan dan favorit pengguna ini juga akan terhapus.`
      )
    ) {
      try {
        await deleteUserAdmin(id, token);
        await loadData();
      } catch (err) {
        alert(err.message || 'Gagal menghapus pengguna');
      }
    }
  };

  // Filtered Pengguna List
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'Semua' || u.role === userRoleFilter;
    const matchSearch =
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  // Jika bukan Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-xs">
          <div className="text-5xl mb-4">⛔</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Halaman ini khusus untuk peran <strong>Admin</strong>. Silakan login menggunakan akun administrator.
          </p>
          <Link
            to="/login"
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-2.5 rounded-full transition"
          >
            Menuju Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* NAVBAR ADMIN */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-black text-emerald-700 tracking-tight">
              Destina<span className="text-amber-500">Taste</span>
            </Link>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
              👑 Admin Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-slate-600 hover:text-emerald-700 font-semibold transition">
              ← Lihat Web
            </Link>
            <div className="hidden sm:block text-slate-500">
              Halo, <strong className="text-slate-800">{user?.name}</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* STATS WIDGETS & EXPORT ACTIONS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pusat Kendali Admin</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola katalog destinasi wisata & kuliner, moderasi ulasan, dan ekspor laporan CSV.
            </p>
          </div>

          {/* TOMBOL EKSPOR CSV */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportDestinations}
              disabled={exportingDest}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              title="Unduh seluruh data destinasi format CSV"
            >
              <span>{exportingDest ? '⏳' : '📥'}</span>
              <span>{exportingDest ? 'Mengekspor...' : 'Ekspor CSV Destinasi'}</span>
            </button>
            <button
              onClick={handleExportReviews}
              disabled={exportingRev}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              title="Unduh seluruh ulasan pengguna format CSV"
            >
              <span>{exportingRev ? '⏳' : '📥'}</span>
              <span>{exportingRev ? 'Mengekspor...' : 'Ekspor CSV Ulasan'}</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-xs font-medium block">Total Destinasi</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.totalDestinations || 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-emerald-600 text-xs font-medium block">Wisata</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {stats?.totalWisata || 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-amber-600 text-xs font-medium block">Kuliner</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats?.totalKuliner || 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-blue-600 text-xs font-medium block">Pengguna</span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {stats?.totalUsers || 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-purple-600 text-xs font-medium block">Total Ulasan</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              {stats?.totalReviews || 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-rose-600 text-xs font-medium block">Total Favorit</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stats?.totalFavorites || 0}
            </span>
          </div>
        </div>

        {/* TAB NAVIGATION: DESTINASI vs ULASAN */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'destinations'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📍 Kelola Destinasi</span>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">
              {destinations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>💬 Moderasi Ulasan & Foto</span>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">
              {reviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>👥 Kelola Pengguna</span>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </button>
        </div>

        {/* TAB 1: KELOLA DESTINASI */}
        {activeTab === 'destinations' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Katalog Destinasi Tegal</h2>
                <p className="text-xs text-slate-500">
                  Data destinasi lengkap yang tersimpan secara real-time di MySQL database.
                </p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>+</span> Tambah Destinasi Baru
              </button>
            </div>

            {/* FILTER & PENCARIAN TABEL */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, kategori, atau lokasi..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs">
                {['Semua', 'Wisata', 'Kuliner'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      selectedType === type
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* TABEL DESTINASI */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Destinasi</th>
                    <th className="py-3 px-4">Tipe &amp; Kategori</th>
                    <th className="py-3 px-4">Harga / Tiket</th>
                    <th className="py-3 px-4">Koordinat GPS</th>
                    <th className="py-3 px-4">Rating &amp; Ulasan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        Memuat data destinasi...
                      </td>
                    </tr>
                  ) : filteredDestinations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        Tidak ada destinasi yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredDestinations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                              onError={(e) => {
                                e.target.src =
                                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80';
                              }}
                            />
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
                                {item.location}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.type === 'Wisata'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {item.price}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {item.latitude && item.longitude ? (
                            <span>
                              📍 {parseFloat(item.latitude).toFixed(3)}, {parseFloat(item.longitude).toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-amber-500 font-bold">★ {parseFloat(item.rating).toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px] block">
                            ({item.reviews_count || 0} ulasan)
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDestination(item.id, item.title)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MODERASI ULASAN & FOTO PENGGUNA */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manajemen & Moderasi Ulasan</h2>
                <p className="text-xs text-slate-500">
                  Pantau feedback wisatawan, tanggapi keluhan, dan hapus komentar yang tidak pantas.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                Total {filteredReviews.length} ulasan terdaftar
              </span>
            </div>

            {/* FILTER ULASAN */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama, ulasan, atau tempat..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Bintang:</span>
                {['Semua', '5', '4', '3', '2', '1'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setReviewRatingFilter(r)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      reviewRatingFilter === r
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'Semua' ? 'Semua' : `★${r}`}
                  </button>
                ))}
              </div>
            </div>

            {/* TABEL ULASAN */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Destinasi</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Ulasan</th>
                    <th className="py-3 px-4">Foto Lampiran</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400">
                        Tidak ada ulasan yang sesuai kriteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{rev.user_name}</span>
                          <span className="text-[10px] text-slate-400 block">{rev.user_email}</span>
                          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {rev.user_role}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-emerald-800">
                          {rev.destination_title}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-amber-500 font-bold">
                            {'★'.repeat(rev.rating)}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-600 line-clamp-2 leading-relaxed">
                            {rev.comment}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          {rev.photo_url ? (
                            <img
                              src={rev.photo_url}
                              alt="Foto Ulasan"
                              onClick={() => setPreviewPhoto(rev.photo_url)}
                              className="w-12 h-12 rounded-lg object-cover cursor-pointer border border-slate-200 hover:scale-105 transition"
                              title="Klik untuk memperbesar foto"
                            />
                          ) : (
                            <span className="text-slate-300 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(rev.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteReviewItem(rev.id, rev.user_name)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAJEMEN PENGGUNA & HAK AKSES */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manajemen Pengguna & Hak Akses</h2>
                <p className="text-xs text-slate-500">
                  Kelola akun pengguna, atur peran hak akses (Admin / Pengguna), dan kelola kata sandi.
                </p>
              </div>

              <button
                onClick={handleOpenAddUser}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>+</span> Tambah Pengguna Baru
              </button>
            </div>

            {/* FILTER & PENCARIAN PENGGUNA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama atau email pengguna..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Peran:</span>
                {[
                  { key: 'Semua', label: 'Semua' },
                  { key: 'admin', label: '👑 Admin' },
                  { key: 'pengguna', label: '👤 Pengguna' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setUserRoleFilter(item.key)}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      userRoleFilter === item.key
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TABEL PENGGUNA */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Terdaftar Sejak</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">
                        Memuat data pengguna...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">
                        Tidak ada pengguna yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const isCurrentUser = item.id === user?.id;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  item.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name || 'User')}`
                                }
                                alt={item.name}
                                className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name || 'User')}`;
                                }}
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 block leading-tight">
                                    {item.name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                      Akun Anda
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  ID: #{item.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {item.email}
                          </td>

                          <td className="py-3 px-4">
                            {item.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                👑 Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                👤 Pengguna
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditUser(item)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
                              >
                                Edit
                              </button>
                              {isCurrentUser ? (
                                <span
                                  className="text-[11px] text-slate-300 px-2 py-1 cursor-not-allowed select-none"
                                  title="Anda tidak dapat menghapus akun Anda sendiri"
                                >
                                  Hapus
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteUser(item.id, item.name)}
                                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* LIGHTBOX MODAL FOTO ULASAN */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shadow-md hover:bg-slate-800"
            >
              ✕
            </button>
            <img
              src={previewPhoto}
              alt="Preview Ulasan"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT DESTINASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditMode ? 'Edit Data Destinasi' : 'Tambah Destinasi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitDestination} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Destinasi *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Sate Batibul Bang Awi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Destinasi *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-white"
                  >
                    <option value="Wisata">Wisata</option>
                    <option value="Kuliner">Kuliner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating Awal (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimasi Tiket / Harga *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: Rp 15.000 / orang"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Desa Danasari, Kec. Bojong, Kab. Tegal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={formData.openHours}
                    onChange={(e) => setFormData({ ...formData, openHours: e.target.value })}
                    placeholder="Contoh: 08.00 - 17.00 WIB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* KOORDINAT GPS (LATITUDE & LONGITUDE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    📍 Latitude (Lintang Peta)
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="Contoh: -6.87123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    📍 Longitude (Bujur Peta)
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="Contoh: 109.13456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <ImageUploadInput
                  label="Foto Sampul Destinasi"
                  sublabel="Unggah foto asli (JPG/PNG/WebP) atau gunakan link gambar"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  token={token}
                  aspect="landscape"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Lengkap *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tuliskan daya tarik dan keunikan destinasi ini..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fasilitas & Keunggulan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="Area Parkir, Mushola, Spot Foto, Warung Makan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="isFeatured" className="text-slate-700 font-semibold cursor-pointer">
                  Tandai sebagai Destinasi Unggulan (Tampil di Beranda)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submitLoading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambahkan Destinasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT PENGGUNA */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isUserEditMode ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {userSubmitError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {userSubmitError}
              </div>
            )}

            <form onSubmit={handleSubmitUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Contoh: Ahmad Fadilah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Email *</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="ahmad@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran / Hak Akses *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-white"
                >
                  <option value="pengguna">👤 Pengguna Biasa</option>
                  <option value="admin">👑 Administrator (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isUserEditMode ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  required={!isUserEditMode}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder={
                    isUserEditMode
                      ? 'Kosongkan jika tidak ingin mengubah kata sandi'
                      : 'Minimal 6 karakter'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
                {isUserEditMode && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hanya isi kolom ini jika ingin me-reset kata sandi pengguna ini.
                  </p>
                )}
              </div>

              <div>
                <ImageUploadInput
                  label="Foto Profil / Avatar Pengguna (Opsional)"
                  sublabel="Unggah foto asli (JPG/PNG/WebP) atau gunakan link online"
                  value={userFormData.avatar}
                  onChange={(url) => setUserFormData({ ...userFormData, avatar: url })}
                  token={token}
                  aspect="circle"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={userSubmitLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {userSubmitLoading
                    ? 'Menyimpan...'
                    : isUserEditMode
                    ? 'Simpan Perubahan'
                    : 'Tambahkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
