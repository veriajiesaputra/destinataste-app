import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Login Cepat untuk Demo 3 Role
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(demoEmail, demoPassword);
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" showTagline={true} className="justify-center mb-2" />
        <h2 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Silakan masuk untuk memberikan ulasan, rating, atau mengelola data destinasi Tegal.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-emerald-600 bg-slate-50 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-emerald-600 bg-slate-50 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* DEMO LOGIN 3 ROLE */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              ⚡ Akses Demo 3 Role
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('budi@gmail.com', 'user123')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition cursor-pointer"
              >
                <span className="block font-bold text-xs text-emerald-800">👤 Pengguna</span>
                <span className="block text-[10px] text-emerald-600">budi@gmail.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@destinataste.com', 'admin123')}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition cursor-pointer"
              >
                <span className="block font-bold text-xs text-rose-800">👑 Admin</span>
                <span className="block text-[10px] text-rose-600">admin@destinataste.com</span>
              </button>
            </div>
            
            <div className="mt-3 text-center">
              <Link
                to="/"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                👁️ Lanjut Jelajahi sebagai Pengunjung (Tanpa Login) →
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:underline">
              Daftar sekarang
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
