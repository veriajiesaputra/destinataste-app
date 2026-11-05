import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageUploadInput from '../components/ImageUploadInput';
import { useAuth } from '../context/AuthContext';
import {
  fetchDestinationById,
  fetchReviews,
  submitReview,
  deleteReview,
  fetchFavoriteIds,
  toggleFavorite,
} from '../services/api';

export default function Detail() {
  const { id } = useParams();
  const { user, token, role, isPengunjung, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favorite State
  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  // Lightbox State
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // Muat data detail, ulasan, dan status favorit
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const promises = [
          fetchDestinationById(id),
          fetchReviews(id),
        ];

        if (token) {
          promises.push(fetchFavoriteIds(token));
        }

        const [destData, revData, favIds] = await Promise.all(promises);

        if (isMounted) {
          setItem(destData);
          setReviews(revData);
          if (favIds && Array.isArray(favIds)) {
            setIsFavorited(favIds.includes(parseInt(id, 10)));
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Destinasi tidak ditemukan');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) loadData();
    return () => {
      isMounted = false;
    };
  }, [id, token]);

  // Handle Toggle Favorit
  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Silakan masuk (login) terlebih dahulu untuk menyimpan destinasi favorit!');
      return;
    }

    try {
      setTogglingFav(true);
      const res = await toggleFavorite(id, token);
      setIsFavorited(res.isFavorited);
    } catch (err) {
      alert('Gagal memperbarui status favorit: ' + err.message);
    } finally {
      setTogglingFav(false);
    }
  };

  // Handle Kirim Ulasan (Pengguna & Admin)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage({ type: '', text: '' });

    try {
      const res = await submitReview(
        id,
        {
          rating: newRating,
          comment: newComment,
          photo_url: newPhotoUrl.trim() || null,
        },
        token
      );

      setReviews([res.data, ...reviews]);
      if (res.updatedStats) {
        setItem((prev) => ({
          ...prev,
          rating: res.updatedStats.rating,
          reviewsCount: res.updatedStats.reviewsCount,
        }));
      }

      setNewComment('');
      setNewPhotoUrl('');
      setNewRating(5);
      setReviewMessage({
        type: 'success',
        text: 'Ulasan Anda berhasil ditambahkan beserta foto lampiran!',
      });
    } catch (err) {
      setReviewMessage({ type: 'error', text: err.message || 'Gagal mengirim ulasan' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Hapus Ulasan (Admin atau Pemilik Ulasan)
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Yakin ingin menghapus ulasan ini?')) {
      try {
        await deleteReview(reviewId, token);
        setReviews(reviews.filter((r) => r.id !== reviewId));
      } catch (err) {
        alert('Gagal menghapus ulasan: ' + err.message);
      }
    }
  };

  // Kumpulan foto dari semua ulasan untuk galeri
  const reviewPhotos = reviews.filter((r) => r.photo_url && r.photo_url.trim() !== '');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-sm w-full mx-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-slate-700">Memuat informasi destinasi...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md w-full mx-4">
          <div className="text-5xl mb-3">🔍</div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Destinasi Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mb-6">
            Destinasi yang Anda cari tidak ditemukan atau telah diperbarui.
          </p>
          <Link
            to="/katalog"
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition"
          >
            Lihat Katalog Lainnya
          </Link>
        </div>
      </div>
    );
  }

  const facilities = Array.isArray(item.facilities) ? item.facilities : [];
  const openHours = item.openHours || item.open_hours || '08.00 - 17.00 WIB';
  const reviewsCount = item.reviewsCount ?? item.reviews_count ?? reviews.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* NAVBAR */}
      <Navbar />

      {/* KONTEN DETAIL */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tombol Kembali & Breadcrumbs */}
        <div className="mb-4">
          <Link
            to="/katalog"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition w-fit"
          >
            ← Kembali ke Katalog
          </Link>
        </div>

        {/* HERO FOTO & JUDUL */}
        <div className="relative rounded-3xl overflow-hidden h-[340px] md:h-[420px] shadow-sm mb-8">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

          {/* FAVORITE BUTTON DI ATAS FOTO */}
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFav}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center shadow-lg transition hover:scale-110 cursor-pointer"
            title={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <svg
              className={`w-6 h-6 transition ${
                isFavorited ? 'fill-rose-500 text-rose-500' : 'fill-none text-slate-500 stroke-2'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-amber-500 text-white font-bold text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {item.category}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                ★ {parseFloat(item.rating).toFixed(1)} ({reviewsCount} Ulasan)
              </span>
              <span className="bg-emerald-600/80 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold">
                {item.type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 drop-shadow-sm">
              {item.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 drop-shadow-sm">
              <span>📍</span> {item.location}
            </p>
          </div>
        </div>

        {/* LAYOUT KONTEN 2 KOLOM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Deskripsi, Fasilitas, Galeri, dan Ulasan */}
          <div className="lg:col-span-2 space-y-6">
            {/* DESKRIPSI LENGKAP */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3">Tentang Destinasi</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* FASILITAS */}
            {facilities.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-3">Fasilitas &amp; Keunggulan</h2>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-medium border border-emerald-100"
                    >
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GALERI FOTO WISATAWAN */}
            {reviewPhotos.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📸 Galeri Foto Wisatawan</span>
                  </h2>
                  <span className="text-xs text-slate-400">
                    {reviewPhotos.length} foto diunggah pengunjung
                  </span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {reviewPhotos.map((rev) => (
                    <div
                      key={rev.id}
                      onClick={() => setActiveLightboxPhoto(rev.photo_url)}
                      className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 hover:scale-105 transition"
                    >
                      <img
                        src={rev.photo_url}
                        alt="Foto Pengunjung"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEKSI ULASAN & KOMENTAR */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Ulasan Pengunjung ({reviews.length})
                </h2>
                <span className="text-amber-500 font-bold text-xs">
                  ★ {parseFloat(item.rating).toFixed(1)} / 5.0
                </span>
              </div>

              {/* JIKA BELUM LOGIN / SEBAGAI PENGUNJUNG BIASA */}
              {isPengunjung && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block">Ingin memberikan ulasan & foto?</span>
                    <span>Masuk sebagai <strong>Pengguna</strong> atau <strong>Admin</strong> untuk menulis ulasan.</span>
                  </div>
                  <Link
                    to="/login"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl transition whitespace-nowrap"
                  >
                    Masuk Sekarang
                  </Link>
                </div>
              )}

              {/* FORM TULIS ULASAN (UNTUK PENGGUNA & ADMIN) */}
              {!isPengunjung && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Tulis Ulasan Anda ({user?.name}):
                    </span>

                    {/* Pemilih Bintang */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`text-lg transition cursor-pointer ${
                            star <= newRating ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">({newRating}/5)</span>
                    </div>
                  </div>

                  <textarea
                    rows="3"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda berkunjung ke tempat ini..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white"
                  ></textarea>

                  {/* INPUT / UNGGAH FOTO PENGALAMAN (BERKAS ASLI ATAU LINK) */}
                  <ImageUploadInput
                    label="📸 Foto Pengalaman (Opsional)"
                    sublabel="Pilih foto asli dari HP/Laptop (JPG/PNG/WebP) atau gunakan link gambar"
                    value={newPhotoUrl}
                    onChange={setNewPhotoUrl}
                    token={token}
                    aspect="landscape"
                    placeholder="https://images.unsplash.com/... atau link foto online"
                  />

                  {reviewMessage.text && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-medium ${
                        reviewMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {reviewMessage.text}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                  </div>
                </form>
              )}

              {/* LIST ULASAN */}
              <div className="space-y-3 pt-2">
                {reviews.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-4">
                    Belum ada ulasan untuk tempat ini. Jadilah yang pertama memberikan ulasan!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              rev.user_avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                rev.user_name
                              )}`
                            }
                            alt={rev.user_name}
                            className="w-7 h-7 rounded-full object-cover bg-slate-200"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-800 block leading-tight">
                              {rev.user_name}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {rev.user_role === 'admin' ? '👑 Admin' : '👤 Pengguna'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold text-xs">
                            {'★'.repeat(rev.rating)}
                          </span>
                          {(isAdmin || (user && user.id === rev.user_id)) && (
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-rose-500 hover:text-rose-700 text-[11px] font-bold ml-1 cursor-pointer"
                              title="Hapus ulasan"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 pl-9 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* FOTO ULASAN JIKA ADA */}
                      {rev.photo_url && (
                        <div className="pl-9 mt-1">
                          <img
                            src={rev.photo_url}
                            alt="Foto Pengalaman Pengunjung"
                            onClick={() => setActiveLightboxPhoto(rev.photo_url)}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-200 cursor-pointer hover:scale-105 transition"
                            title="Klik untuk melihat foto lebih besar"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Info Cepat & Tombol Aksi */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
                  Estimasi Tiket / Harga
                </span>
                <span className="text-xl font-black text-emerald-700">{item.price}</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
                  Jam Operasional
                </span>
                <span className="text-xs font-semibold text-slate-700">{openHours}</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
                  Lokasi Lengkap
                </span>
                <span className="text-xs text-slate-600 leading-relaxed block mt-1">
                  {item.location}
                </span>
              </div>

              {/* AKSI: DIRECTIONS GOOGLE MAPS */}
              <div className="border-t border-slate-100 pt-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.title + ' ' + item.location
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-2.5 rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>🧭</span> Petunjuk Arah Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LIGHTBOX MODAL */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveLightboxPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl">
            <button
              onClick={() => setActiveLightboxPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shadow-md hover:bg-slate-800"
            >
              ✕
            </button>
            <img
              src={activeLightboxPhoto}
              alt="Ulasan Pengunjung"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
