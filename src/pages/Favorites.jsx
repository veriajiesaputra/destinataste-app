import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFavorites, toggleFavorite } from '../services/api';
import Navbar from '../components/Navbar';

export default function Favorites() {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && token) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await fetchFavorites(token);
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat data favorit');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (destinationId, title) => {
    try {
      await toggleFavorite(destinationId, token);
      setFavorites((prev) => prev.filter((item) => item.id !== destinationId));
    } catch (err) {
      alert('Gagal menghapus favorit: ' + err.message);
    }
  };

  const filteredFavorites = favorites.filter((item) => {
    if (activeTab === 'Semua') return true;
    return item.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* HEADER HERO */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <span className="text-9xl">❤️</span>
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 text-emerald-100">
              <span>❤️ Wishlist Destinasi Anda</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Koleksi Destinasi Favorit
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Simpan dan rencanakan kunjungan Anda ke destinasi wisata alam dan tempat kuliner otentik terbaik di Tegal.
            </p>
          </div>
        </div>

        {/* JIKA BELUM LOGIN */}
        {!user ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Fitur Favorit</h2>
            <p className="text-slate-500 text-sm mb-6">
              Silakan masuk ke akun DestinaTaste Anda untuk menyimpan dan melihat destinasi favorit pribadi Anda.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition"
              >
                Masuk Sekarang
              </Link>
              <Link
                to="/register"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition"
              >
                Daftar Akun
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm font-medium">Memuat destinasi favorit Anda...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center">
            <p className="font-semibold mb-2">Terjadi Kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : favorites.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center shadow-xs max-w-xl mx-auto">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-inner">
              🤍
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Destinasi Favorit</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Anda belum menandai destinasi apa pun. Klik ikon hati ❤️ pada kartu destinasi di katalog atau halaman beranda untuk menyimpannya di sini.
            </p>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg"
            >
              <span>🔍 Jelajahi Katalog Tegal</span>
            </Link>
          </div>
        ) : (
          /* FAVORITES LIST */
          <div>
            {/* FILTER TABS */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                {['Semua', 'Wisata', 'Kuliner'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === tab
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab === 'Semua' ? `Semua (${favorites.length})` : tab}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {filteredFavorites.length} destinasi favorit
              </span>
            </div>

            {/* CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                >
                  {/* FOTO & OVERLAY */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-xs ${
                          item.type === 'Wisata' ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-xs text-white">
                        {item.category}
                      </span>
                    </div>

                    {/* UNFAVORITE BUTTON */}
                    <button
                      onClick={() => handleRemoveFavorite(item.id, item.title)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-rose-500 shadow-md flex items-center justify-center transition hover:scale-110"
                      title="Hapus dari favorit"
                    >
                      <svg className="w-5 h-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  {/* KONTEN */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1.5">
                        <span>★</span>
                        <span>{parseFloat(item.rating).toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({item.reviews_count} ulasan)</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2 line-clamp-1">
                        <span>📍</span> {item.location}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimasi Biaya</span>
                        <span className="text-xs font-bold text-emerald-700">{item.price}</span>
                      </div>
                      <Link
                        to={`/detail/${item.id}`}
                        className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition"
                      >
                        Detail &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
