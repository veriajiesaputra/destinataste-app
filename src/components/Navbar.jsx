import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

export default function Navbar({ searchQuery, setSearchQuery, showSearch = false }) {
  const { user, role, logout, isAdmin, isPengguna } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center">
          <BrandLogo size="md" showTagline={true} />
        </div>

        {/* MENU UTAMA */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-600">
          <Link to="/" className="hover:text-emerald-700 transition">
            Beranda
          </Link>
          <Link to="/katalog?type=Wisata" className="hover:text-emerald-700 transition">
            Wisata
          </Link>
          <Link to="/katalog?type=Kuliner" className="hover:text-emerald-700 transition">
            Kuliner
          </Link>
          <Link to="/itinerary" className="hover:text-emerald-700 transition">
            Rencana AI
          </Link>

          {user && (
            <Link to="/favorit" className="hover:text-emerald-700 transition">
              Favorit
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1 rounded-full text-xs font-bold transition border border-rose-200"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* SEARCH BAR & USER CONTROLS */}
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative hidden lg:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari wisata atau kuliner Tegal..."
                className="bg-slate-100 rounded-full pl-9 pr-4 py-2 text-xs w-56 focus:outline-emerald-600 border border-slate-200"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z"
                />
              </svg>
            </div>
          )}

          {/* KONDISI PERAN (ROLE) */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profil"
                className="flex items-center gap-2 hover:opacity-90 transition group p-1 -m-1 rounded-xl"
                title="Edit Profil Akun"
              >
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px] group-hover:text-emerald-700">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                </div>
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100 group-hover:ring-2 group-hover:ring-emerald-500/50"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition cursor-pointer"
                title="Keluar dari akun"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 transition"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition shadow-xs"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
