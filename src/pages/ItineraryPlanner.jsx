import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAIItinerary } from '../services/api';
import Navbar from '../components/Navbar';

export default function ItineraryPlanner() {
  const { user, token } = useAuth();

  const [duration, setDuration] = useState('2');
  const [travelStyle, setTravelStyle] = useState('Santai & Kuliner');
  const [budget, setBudget] = useState('Menengah');
  const [preferences, setPreferences] = useState('');

  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [error, setError] = useState(null);

  // Slideshow Foto Rekomendasi Kuliner & Wisata (Gaya Beranda yang Simple & Elegan)
  const heroSlides = [
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
      title: 'Sate Kambing Muda Batibul Bang Awi',
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
      id: 6,
      title: 'Waduk Cacaban & Lereng Gunung Slamet',
      category: 'Wisata Alam',
      type: 'Wisata',
      rating: 4.5,
      reviews_count: 510,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
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
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide berganti setiap 4 detik dengan transisi halus
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  const durationOptions = [
    { value: '1', label: '1 Hari', subtitle: 'One Day Trip' },
    { value: '2', label: '2 Hari 1 Malam', subtitle: 'Weekend Getaway' },
    { value: '3', label: '3 Hari 2 Malam', subtitle: 'Jelajah Lengkap' },
  ];

  const travelStyleOptions = [
    { id: 'Santai & Kuliner', icon: '🍲', desc: 'Kuliner legendaris & santai santap' },
    { id: 'Wisata Alam & Petualangan', icon: '🌲', desc: 'Guci, air terjun & perbukitan' },
    { id: 'Wisata Keluarga & Edukasi', icon: '👨‍👩‍👧‍👦', desc: 'Museum Semedo, pantai & wahana' },
    { id: 'Backpacker Hemat', icon: '🎒', desc: 'Eksplorasi seru budget efisien' },
  ];

  const budgetOptions = [
    { id: 'Hemat', label: 'Hemat', desc: '< Rp 200rb / hari' },
    { id: 'Menengah', label: 'Menengah', desc: 'Rp 200rb - Rp 500rb / hari' },
    { id: 'Sultan', label: 'Sultan / Nyaman', desc: '> Rp 500rb / hari' },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan masuk (login) terlebih dahulu untuk membuat rencana perjalanan AI!');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await generateAIItinerary(
        {
          duration,
          travelStyle,
          budget,
          preferences,
        },
        token
      );

      if (res.success && res.itinerary) {
        setItinerary(res.itinerary);
        setSelectedDay(1);
      } else {
        throw new Error(res.message || 'Gagal menghasilkan rencana perjalanan.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyusun rencana perjalanan.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDayData = itinerary?.days?.find((d) => d.day === selectedDay) || itinerary?.days?.[0];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HERO SECTION DENGAN SLIDER OTOMATIS SEPERTI BERANDA (SIMPLE & ELEGAN) */}
        <section id="hero" className="w-full">
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/92 via-emerald-900/70 to-transparent pointer-events-none z-10"></div>

            {/* KONTEN TEKS & TOMBOL (GAYA BERANDA) */}
            <div className="relative z-20 max-w-xl pl-8 sm:pl-12 lg:pl-14 pr-6 py-10 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/20 backdrop-blur-md mb-4 text-emerald-100 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>DestinaTaste AI Travel Planner</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-tight">
                Rencana Perjalanan<br />
                Eksklusif Tegal
              </h1>

              <p className="mt-4 text-xs sm:text-sm text-slate-100/90 leading-relaxed max-w-md font-sans">
                Susun agenda liburan impian secara instan. AI menganalisis koordinat geografis, efisiensi rute, jam operasional kuliner otentik, dan alokasi anggaran terbaik untuk Anda.
              </p>

              {/* TOMBOL RENCANAKAN SEKARANG (GAYA BERANDA) */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#form-rencana"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('form-rencana');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>✨ Rencanakan Sekarang</span>
                  <span className="text-xs">&darr;</span>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-white/90 font-medium">
                <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                  <span>📍</span> 24+ Destinasi Resmi
                </span>
                <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                  <span>⚡</span> Waktu Tempuh Akurat
                </span>
                <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                  <span>🍲</span> Kuliner Legendaris
                </span>
              </div>
            </div>

            {/* POJOK KANAN BAWAH: MURNI TULISAN SEPERTI BERANDA */}
            <Link
              to={`/detail/${activeSlide.id}`}
              key={activeSlide.id}
              className="absolute bottom-4 right-6 z-20 text-[11px] sm:text-xs text-white/90 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group"
              title={`Klik untuk melihat detail ${activeSlide.title}`}
            >
              <span className="font-semibold group-hover:underline">
                {activeSlide.title}{' '}
                <span className="text-white/80 font-normal">
                  (<span className="text-amber-400 font-semibold">★</span> {parseFloat(activeSlide.rating || 4.5).toFixed(1)} &bull; {Number(activeSlide.reviews_count || 0).toLocaleString('id-ID')} ulasan)
                </span>
              </span>
              <span className="text-[10px] text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>
        </section>

        {/* JIKA BELUM LOGIN */}
        {!user ? (
          <div id="form-rencana" className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] max-w-lg mx-auto scroll-mt-24">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 border border-emerald-100 shadow-xs">
              🔒
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Login untuk Menggunakan AI Planner</h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-7 leading-relaxed">
              Daftar atau masuk ke akun DestinaTaste Anda untuk menyusun rencana perjalanan personal berbasis kecerdasan buatan.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-xs hover:shadow-md cursor-pointer"
              >
                Masuk Sekarang
              </Link>
              <Link
                to="/register"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition cursor-pointer"
              >
                Daftar Akun
              </Link>
            </div>
          </div>
        ) : (
          <div id="form-rencana" className="space-y-8 scroll-mt-24">
            {/* 1. KUSTOMISASI CARD (HORIZONTAL / LEBAR KE SAMPING) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Kustomisasi Liburan Anda
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Atur preferensi perjalanan Anda di bawah ini, AI akan memadukan wisata dan kuliner secara optimal.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 w-fit self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Generator Otomatis</span>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-8">
                {/* BARIS 1: DURASI & BUDGET (2 KOLOM GRID) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {/* STEP 1: DURASI */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <label className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                        Durasi Liburan
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {durationOptions.map((opt) => {
                        const isSelected = duration === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setDuration(opt.value)}
                            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? 'border-emerald-600 bg-linear-to-b from-emerald-50/90 to-teal-50/30 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                            }`}
                          >
                            <div className="text-xs sm:text-sm font-bold tracking-tight">{opt.label}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {opt.subtitle}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 2: BUDGET */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <label className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                        Estimasi Anggaran
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {budgetOptions.map((b) => {
                        const isSelected = budget === b.id;
                        return (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => setBudget(b.id)}
                            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? 'border-emerald-600 bg-linear-to-b from-emerald-50/90 to-teal-50/30 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                            }`}
                          >
                            <div className="text-xs sm:text-sm font-bold tracking-tight">{b.label}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {b.desc}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BARIS 2: GAYA LIBURAN (4 KOLOM HORIZONTAL GRID) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <label className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      Gaya & Minat Perjalanan
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {travelStyleOptions.map((style) => {
                      const isSelected = travelStyle === style.id;
                      return (
                        <div
                          key={style.id}
                          onClick={() => setTravelStyle(style.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 group relative ${
                            isSelected
                              ? 'border-emerald-600 bg-linear-to-b from-emerald-50/80 to-teal-50/20 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${
                              isSelected ? 'bg-white shadow-xs border border-emerald-200' : 'bg-slate-100 group-hover:bg-slate-200/70'
                            }`}
                          >
                            {style.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                              {style.id}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {style.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BARIS 3: CATATAN KHUSUS & TOMBOL SUBMIT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end pt-3 border-t border-slate-100">
                  <div className="lg:col-span-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        4
                      </span>
                      <label className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                        Catatan / Permintaan Khusus (Opsional)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="Contoh: Wajib ada Sate Kambing Batibul, singgah ke Guci, bawa balita..."
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-md hover:shadow-lg hover:shadow-emerald-900/10 flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyusun Rencana AI...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Buat Rencana Perjalanan AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* 2. HASIL ITINERARY (LETAK DI BAWAH CARD / FULL WIDTH) */}
            <div className="w-full">
              {loading ? (
                /* LOADING STATE ELEGAN */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-14 sm:p-16 text-center shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)]">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
                    DestinaTaste AI Sedang Menyusun Rute...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Menghitung jarak antar-destinasi wisata, menyelaraskan jam operasional kuliner, dan mengoptimalkan jadwal liburan Anda.
                  </p>
                </div>
              ) : error ? (
                /* ERROR STATE */
                <div className="bg-rose-50/80 border border-rose-200 text-rose-800 p-8 rounded-3xl text-center shadow-xs">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                    ⚠️
                  </div>
                  <p className="font-bold text-sm mb-1">Gagal Menyusun Rencana Perjalanan</p>
                  <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
                </div>
              ) : !itinerary ? (
                /* EMPTY STATE PREVIEW ELEGAN */
                <div className="bg-white rounded-3xl border border-dashed border-slate-200/90 p-12 sm:p-16 text-center shadow-[0_10px_35px_-5px_rgba(0,0,0,0.02)]">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-slate-100">
                    🗺️
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
                    Rencana Perjalanan Siap Dibuat
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Tentukan preferensi di panel atas dan klik <span className="font-semibold text-emerald-700">"Buat Rencana Perjalanan AI"</span> untuk melihat jadwal terperinci, rekomendasi menu, dan perkiraan biaya.
                  </p>
                </div>
              ) : (
                /* ITINERARY RESULT CARD ELEGAN */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] space-y-8">
                  {/* HEADER RESULT */}
                  <div className="border-b border-slate-100 pb-7">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-bold px-3 py-1 rounded-full">
                          {itinerary.duration}
                        </span>
                        <span className="bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-bold px-3 py-1 rounded-full">
                          {itinerary.travelStyle}
                        </span>
                      </div>
                      <button
                        onClick={handlePrint}
                        className="text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100/80 hover:bg-slate-200/80 px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-200/60"
                      >
                        <span>🖨️ Cetak / Simpan Rencana</span>
                      </button>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2.5">
                      {itinerary.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl mb-6">
                      {itinerary.summary}
                    </p>

                    {/* METRICS BAR */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                          Total Perkiraan Biaya
                        </span>
                        <span className="text-base sm:text-lg font-black text-emerald-700">
                          {itinerary.estimatedBudgetTotal}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 sm:text-right">
                        <span>Estimasi mencakup tiket masuk, sewa/transport lokal, & kuliner</span>
                      </div>
                    </div>
                  </div>

                  {/* DAY TABS */}
                  {itinerary.days?.length > 1 && (
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto">
                      {itinerary.days.map((d) => {
                        const isSelected = selectedDay === d.day;
                        return (
                          <button
                            key={d.day}
                            onClick={() => setSelectedDay(d.day)}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Hari ke-{d.day}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* CURRENT DAY TIMELINE */}
                  {currentDayData && (
                    <div className="space-y-6">
                      <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-100">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                          Agenda Hari ke-{currentDayData.day}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {currentDayData.theme}
                        </h3>
                      </div>

                      {/* TIMELINE ACTIVITIES */}
                      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
                        {currentDayData.schedule?.map((item, idx) => (
                          <React.Fragment key={idx}>
                            {/* INDIKATOR TRANSIT/PERJALANAN ANTAR-ZONA */}
                            {item.transitBefore && item.transitBefore.trim() !== '' && (
                              <div className="relative flex items-center gap-4 sm:gap-6 py-1">
                                <div className="w-8 flex justify-center z-10 shrink-0">
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-50"></div>
                                </div>
                                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border border-slate-200 shadow-xs">
                                  <span>🚗</span>
                                  <span>{item.transitBefore}</span>
                                </div>
                              </div>
                            )}

                            <div className="relative flex items-start gap-4 sm:gap-6 group">
                              {/* PERIOD BULLET */}
                              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold z-10 shrink-0 shadow-xs ring-4 ring-white">
                                {item.period === 'Pagi' ? '🌅' : item.period === 'Siang' ? '☀️' : item.period === 'Sore' ? '🌇' : '🌙'}
                              </div>

                              {/* ITEM CARD ELEGAN */}
                              <div className="flex-1 bg-white hover:bg-emerald-50/30 p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300/80 transition-all shadow-xs group-hover:shadow-sm">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-900">
                                      {item.time}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs font-semibold text-slate-700">
                                      {item.activity}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
                                    {item.estimatedCost}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5 pt-1 border-t border-slate-100">
                                  <span className="text-xs sm:text-sm font-black text-emerald-900 flex items-center gap-1.5">
                                    📍 {item.destinationTitle}
                                  </span>
                                  {item.destinationId && (
                                    <Link
                                      to={`/detail/${item.destinationId}`}
                                      className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-bold inline-flex items-center gap-1"
                                    >
                                      <span>Lihat Detail Wisata</span>
                                      <span>&rarr;</span>
                                    </Link>
                                  )}
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                  {item.notes}
                                </p>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PACKING & TRAVEL TIPS */}
                  {itinerary.packingTips && itinerary.packingTips.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200/70 rounded-3xl p-5 sm:p-6 mt-8">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2 mb-3 tracking-wide uppercase">
                        <span>💡 Tips & Rekomendasi Esensial:</span>
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-900">
                        {itinerary.packingTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
