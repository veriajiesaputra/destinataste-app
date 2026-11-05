import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { fetchDestinations, fetchCategories, fetchFavoriteIds, toggleFavorite } from '../services/api';

const FALLBACK_CATEGORIES = [
  { id: 1, slug: 'alam', name: 'Wisata Alam', icon: '🌲', sub: 'Guci, Curug & Danau', type: 'Wisata' },
  { id: 2, slug: 'bahari', name: 'Wisata Bahari', icon: '🌊', sub: 'Pantai & Pesisir', type: 'Wisata' },
  { id: 3, slug: 'kuliner', name: 'Kuliner Tradisional', icon: '🍲', sub: 'Sate, Sauto & Glabed', type: 'Kuliner' },
  { id: 4, slug: 'sejarah', name: 'Wisata Sejarah', icon: '🏛️', sub: 'Situs & Museum', type: 'Wisata' },
  { id: 5, slug: 'hiburan', name: 'Taman & Hiburan', icon: '🎡', sub: 'Wahana & Rekreasi', type: 'Wisata' },
  { id: 6, slug: 'oleholeh', name: 'Oleh-Oleh Khas', icon: '🫖', sub: 'Tahu Aci & Latopia', type: 'Kuliner' },
];

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    title: 'Kawah & Pemandian Air Hangat Guci',
    category: 'Wisata Alam',
    type: 'Wisata',
    rating: 4.8,
    reviews_count: 1420,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 3,
    title: 'Sate Kambing Muda Batibul',
    category: 'Kuliner Tradisional',
    type: 'Kuliner',
    rating: 4.9,
    reviews_count: 2350,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 2,
    title: 'Pantai Alam Indah (PAI)',
    category: 'Wisata Bahari',
    type: 'Wisata',
    rating: 4.6,
    reviews_count: 980,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 16,
    title: 'Sauto Tegal Tauco Sedap Malam',
    category: 'Kuliner Tradisional',
    type: 'Kuliner',
    rating: 4.9,
    reviews_count: 3100,
    image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 11,
    title: 'Alun-Alun & Menara Air Heritage Tegal',
    category: 'Wisata Sejarah',
    type: 'Wisata',
    rating: 4.8,
    reviews_count: 1650,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 4,
    title: 'Tahu Aci Banjaran Slawi',
    category: 'Oleh-Oleh Khas',
    type: 'Kuliner',
    rating: 4.8,
    reviews_count: 870,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 10,
    title: 'Pantai Muarareja Indah',
    category: 'Wisata Bahari',
    type: 'Wisata',
    rating: 4.6,
    reviews_count: 820,
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 5,
    title: 'Kupat Glabed Ibu Wartini',
    category: 'Kuliner Tradisional',
    type: 'Kuliner',
    rating: 4.7,
    reviews_count: 620,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=80',
  },
];

export default function Home() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Ambil data real dari MySQL Database via Express API
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
            setCategories(catData);
          }
          if (favIds) {
            setFavoriteIds(favIds);
          }
        }
      } catch (err) {
        console.warn('Backend API memuat fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [token]);

  // Ambil destinasi wisata & kuliner terpopuler secara selang-seling (Wisata -> Kuliner -> Wisata -> Kuliner...)
  const heroSlides = React.useMemo(() => {
    const scoreFn = (d) =>
      (parseFloat(d.rating) || 0) * 1000 + (parseInt(d.reviews_count || d.reviewsCount, 10) || 0);

    const wisataList = destinations
      .filter((d) => d.type === 'Wisata' && d.image)
      .sort((a, b) => scoreFn(b) - scoreFn(a));

    const kulinerList = destinations
      .filter((d) => d.type === 'Kuliner' && d.image)
      .sort((a, b) => scoreFn(b) - scoreFn(a));

    if (wisataList.length === 0 && kulinerList.length === 0) {
      return DEFAULT_HERO_SLIDES;
    }

    // Selang-seling: Wisata, Kuliner, Wisata, Kuliner...
    const interleaved = [];
    const maxItems = Math.max(wisataList.length, kulinerList.length);
    for (let i = 0; i < maxItems && interleaved.length < 8; i++) {
      if (wisataList[i]) interleaved.push(wisataList[i]);
      if (kulinerList[i]) interleaved.push(kulinerList[i]);
    }

    return interleaved.length > 0 ? interleaved : DEFAULT_HERO_SLIDES;
  }, [destinations]);

  // Auto slide berganti setiap 3.8 detik (durasi pas: tidak terlalu cepat, tidak terlalu lambat)
  useEffect(() => {
    if (!heroSlides || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [heroSlides]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

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

  // Filter destinasi:
  const filteredHighlights = destinations.filter((item) => {
    const isSearching = searchQuery.trim().length > 0;
    const matchesFeatured = isSearching ? true : item.isFeatured;
    const matchesFilter = selectedFilter === 'Semua' || item.type === selectedFilter;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFeatured && matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 1. NAVBAR DENGAN ROLE SELECTOR (PENGUNJUNG, PENGGUNA, ADMIN) */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} showSearch={true} />

      {/* 2. HERO SECTION DENGAN SLIDER OTOMATIS & KLIK DETAIL */}
      <section id="hero" className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-6 max-w-7xl mx-auto">
        <div className="relative w-full rounded-3xl overflow-hidden min-h-[440px] md:min-h-[480px] flex items-center shadow-sm">
          {/* SLIDES GAMBAR DENGAN TRANSISI HALUS (FADE) */}
          {heroSlides.map((slide, idx) => (
            <img
              key={slide.id || idx}
              src={slide.image}
              alt={slide.title}
              loading="eager"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
              }`}
            />
          ))}

          {/* GRADIENT OVERLAY EMERALD (MEMPERTAHANKAN DESAIN ASLI & TEKS JELAS) */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/65 to-transparent pointer-events-none z-10"></div>

          {/* KONTEN TEKS & TOMBOL (DESAIN TIDAK DIUBAH) */}
          <div className="relative z-20 max-w-xl pl-8 sm:pl-12 lg:pl-14 pr-6 py-10 text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-tight">
              Jelajahi Pesona &amp;<br />
              Cita Rasa Khas Tegal
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-slate-100/90 leading-relaxed max-w-md font-sans">
              Temukan pesona wisata alam memukau, kelezatan kuliner legendaris, dan panduan perjalanan terbaik untuk pengalaman liburan tak terlupakan di Tegal.
            </p>
            
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/katalog?type=Wisata"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-xs transition-all"
              >
                Mulai Jelajahi
              </Link>
              <Link
                to="/katalog?type=Kuliner"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-xs transition-all"
              >
                Cari Kuliner
              </Link>
            </div>
          </div>

          {/* POJOK KANAN BAWAH: MURNI TULISAN TANPA CARD / BOX (BISA DIKLIK DETAIL) */}
          <Link
            to={`/detail/${activeSlide.id}`}
            key={activeSlide.id}
            className="absolute bottom-4 right-6 z-20 text-[11px] sm:text-xs text-white/90 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group"
            title={`Klik untuk melihat detail ${activeSlide.title}`}
          >
            <span className="font-semibold group-hover:underline">
              {activeSlide.title}{' '}
              <span className="text-white/80 font-normal">
                (<span className="text-amber-400 font-semibold">★</span> {parseFloat(activeSlide.rating || 4.5).toFixed(1)} &bull; {Number(activeSlide.reviews_count || activeSlide.reviewsCount || 0).toLocaleString('id-ID')} ulasan)
              </span>
            </span>
            <span className="text-[10px] text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* 3. KATEGORI CEPAT DARI DATABASE */}
      <section id="kategori" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Bagian Kategori Cepat</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id || cat.slug}
                to={`/katalog?type=${cat.type}`}
                className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center hover:border-emerald-500 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl mb-2">
                  {cat.icon}
                </div>
                <span className="font-bold text-xs text-slate-800 leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/katalog?type=Kuliner" className="bg-emerald-50/70 border border-emerald-100 hover:border-emerald-400 rounded-2xl p-4 flex items-center justify-between transition">
              <div>
                <span className="font-bold text-xs sm:text-sm text-emerald-950 block">Oleh-Oleh</span>
                <span className="font-semibold text-xs text-emerald-800">khas Tegal</span>
              </div>
              <div className="text-3xl">🫖</div>
            </Link>

            <Link to="/detail/4" className="bg-emerald-50/70 border border-emerald-100 hover:border-emerald-400 rounded-2xl p-4 flex items-center justify-between transition">
              <div>
                <span className="font-bold text-xs sm:text-sm text-emerald-950 block">Tahu Aci</span>
                <span className="font-semibold text-xs text-emerald-800">Banjaran Slawi</span>
              </div>
              <div className="text-3xl">🥟</div>
            </Link>
          </div>

        </div>
      </section>

      {/* 4. REKOMENDASI TERPOPULER DARI DATABASE */}
      <section id="rekomendasi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Bagian Rekomendasi Terpopuler'}
            </h2>
            <p className="text-xs text-slate-500">
              {searchQuery ? `Ditemukan ${filteredHighlights.length} destinasi` : 'Pilihan destinasi wisata favorit dan kuliner legendaris khas Tegal'}
            </p>
          </div>

          <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            {['Semua', 'Wisata', 'Kuliner'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  selectedFilter === filter
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 border border-slate-100 animate-pulse">
                <div className="h-32 sm:h-36 bg-slate-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredHighlights.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
            <p className="text-slate-500 text-xs sm:text-sm">
              Tidak ditemukan tempat dengan kata kunci "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredHighlights.map((item) => (
              <Link
                to={`/detail/${item.id}`}
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer block group"
              >
                <div className="h-32 sm:h-36 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {/* TOMBOL FAVORIT CARD */}
                  <button
                    onClick={(e) => handleToggleFav(e, item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center shadow-xs transition hover:scale-110 z-10 cursor-pointer"
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

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-700 transition">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-1">
                      <span>★</span>
                      <span className="font-bold text-slate-700">{item.rating}</span>
                      <span className="text-[10px] text-slate-400">({item.reviews_count || item.reviewsCount || 0})</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[80px]">📍 {item.location}</span>
                    <span className="bg-amber-500 text-white font-semibold px-2 py-0.5 rounded-full text-[10px]">
                      {item.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-10 pb-6 w-full mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <span className="text-xl font-black text-emerald-700 tracking-tight">
                Destina<span className="text-amber-500">Taste</span>
              </span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Panduan digital terpercaya untuk menjelajahi keindahan alam, kekayaan budaya, dan kenikmatan kuliner legendaris khas Tegal.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-900 mb-2">Destinasi Populer</h4>
              <p className="text-xs text-slate-500">Pemandian Guci • Pantai PAI • Sate Batibul • Sauto Tauco • Tahu Aci</p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-900 mb-2">Layanan Cerdas</h4>
              <p className="text-xs text-slate-500 font-medium">Asisten AI 24/7 • Rencana Perjalanan • Ulasan Wisatawan</p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} DestinaTaste. Jelajahi, Nikmati, dan Rayakan Pesona Tegal.
          </div>
        </div>
      </footer>

    </div>
  );
}
