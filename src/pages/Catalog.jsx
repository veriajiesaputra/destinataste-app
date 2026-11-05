import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { fetchDestinations, fetchCategories, fetchFavoriteIds, toggleFavorite } from '../services/api';

const DEFAULT_CATEGORIES = [
  'Semua',
  'Wisata Alam',
  'Wisata Bahari',
  'Wisata Sejarah',
  'Taman & Hiburan',
  'Kuliner Tradisional',
  'Oleh-Oleh Khas',
];

export default function Catalog() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'Semua';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Ambil data dari database MySQL
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const promises = [fetchDestinations(), fetchCategories()];
        if (token) {
          promises.push(fetchFavoriteIds(token));
        }

        const [destData, catData, favIds] = await Promise.all(promises);

        if (isMounted) {
          if (destData && destData.length > 0) {
            setDestinations(destData);
          }
          if (catData && catData.length > 0) {
            const uniqueCatNames = ['Semua', ...new Set(catData.map((c) => c.name))];
            setCategories(uniqueCatNames);
          }
          if (favIds) {
            setFavoriteIds(favIds);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat katalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [token]);

  const handleToggleFav = async (e, destId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Silakan masuk (login) terlebih dahulu untuk menyimpan destinasi favorit!');
      return;
    }

    try {
      const res = await toggleFavorite(destId, token);
      if (res.isFavorited) {
        setFavoriteIds((prev) => [...prev, destId]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== destId));
      }
    } catch (err) {
      alert('Gagal memperbarui favorit: ' + err.message);
    }
  };

  // Update selectedType jika query param di URL berubah
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl) {
      setSelectedType(typeFromUrl);
      setSelectedCategory('Semua');
    }
  }, [searchParams]);

  // Filter data berdasarkan searchKeyword, selectedType, dan selectedCategory
  const filteredData = destinations.filter((item) => {
    const matchType = selectedType === 'Semua' || item.type === selectedType;
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch =
      (item.title || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchKeyword.toLowerCase());

    return matchType && matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <Navbar />

      {/* HEADER SECTION */}
      <section className="bg-emerald-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">Katalog Eksplorasi Tegal</h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
            Temukan tempat wisata alam mempesona, warisan budaya bersejarah, dan kelezatan kuliner otentik terfavorit di seluruh penjuru Tegal.
          </p>

          {/* SEARCH BAR DI DALAM KATALOG */}
          <div className="mt-6 max-w-lg mx-auto">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Ketik nama tempat wisata atau kuliner Tegal..."
              className="w-full px-5 py-3 rounded-full text-slate-800 text-xs sm:text-sm focus:outline-emerald-500 shadow-md bg-white"
            />
          </div>
        </div>
      </section>

      {/* FILTER & HASIL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* TABS FILTER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          
          {/* Filter Tipe: Semua / Wisata / Kuliner */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            {['Semua', 'Wisata', 'Kuliner'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  selectedType === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Filter Dropdown / Kategori Spesifik */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 focus:outline-emerald-600 font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
                <div className="h-40 bg-slate-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">Tidak ditemukan destinasi yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredData.map((item) => (
              <Link
                key={item.id}
                to={`/detail/${item.id}`}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <span
                    className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs ${
                      item.type === 'Wisata' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  >
                    {item.type}
                  </span>

                  {/* TOMBOL FAVORIT */}
                  <button
                    onClick={(e) => handleToggleFav(e, item.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center shadow-xs transition hover:scale-110 z-10 cursor-pointer"
                    title={favoriteIds.includes(item.id) ? 'Hapus favorit' : 'Tambah favorit'}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        favoriteIds.includes(item.id)
                          ? 'fill-rose-500 text-rose-500'
                          : 'fill-none text-slate-400 stroke-2'
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
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-semibold block mb-0.5">{item.category}</span>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-emerald-700 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.price}</span>
                    <span className="text-amber-500 font-semibold">★ {item.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} DestinaTaste Tegal. Panduan Liburan & Wisata Kuliner Terbaik.
      </footer>

    </div>
  );
}
