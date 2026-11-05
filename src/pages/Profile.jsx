import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import Navbar from '../components/Navbar';
import ImageUploadInput from '../components/ImageUploadInput';

export default function Profile() {
  const { user, token, updateUserSession } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Avatar presets using Dicebear
  const avatarPresets = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`,
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'Traveler')}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'Explorer')}`,
    `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name || 'Foodie')}`,
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Nama dan email tidak boleh kosong!' });
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Masukkan kata sandi lama Anda untuk mengganti kata sandi baru!' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Kata sandi baru minimal 6 karakter!' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok!' });
        return;
      }
    }

    try {
      setLoading(true);
      const res = await updateUserProfile(
        {
          name: name.trim(),
          email: email.trim(),
          avatar: avatar.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        },
        token
      );

      if (res.success) {
        updateUserSession(res.user, res.token);
        setMessage({ type: 'success', text: 'Profil Anda berhasil diperbarui!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(res.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat menyimpan profil' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-200">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Terbatas</h2>
          <p className="text-xs text-slate-500 mb-6">Silakan login untuk mengelola profil akun Anda.</p>
          <Link
            to="/login"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-xs"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            Pengaturan Profil Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Perbarui informasi nama, email, foto avatar, dan kata sandi akun DestinaTaste Anda.
          </p>
        </div>

        {/* ALERT NOTIFIKASI */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* KIRI: KARTU IDENTITAS & AVATAR PREVIEW */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 text-center shadow-xs">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`}
                alt="Avatar Pengguna"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 bg-slate-50 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900">{name || 'Nama Pengguna'}</h3>
            <p className="text-xs text-slate-500 mb-3">{email}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-6">
              <span>{user.role === 'admin' ? '👑 Admin' : '👤 Pengguna'}</span>
            </div>

            <div className="border-t border-slate-100 pt-4 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Status Akun:</span>
                <span className="font-bold text-emerald-700">Aktif & Terverifikasi</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Destinasi Favorit:</span>
                <Link to="/favorit" className="text-emerald-600 hover:text-emerald-800 font-bold underline">
                  Buka Favorit &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* KANAN: FORMULIR EDIT PROFIL */}
          <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: DATA UTAMA */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                  1. Informasi Dasar
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-slate-50/50 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-slate-50/50 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <ImageUploadInput
                      label="Foto Profil / Avatar"
                      sublabel="Unggah foto Anda dari perangkat (JPG/PNG/WebP) atau gunakan link online"
                      value={avatar}
                      onChange={setAvatar}
                      token={token}
                      aspect="circle"
                      placeholder="https://contoh.com/foto-anda.jpg"
                      presetAvatars={avatarPresets}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: GANTI KATA SANDI (OPSIONAL) */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  2. Ubah Kata Sandi (Opsional)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Kosongkan bagian ini jika Anda tidak ingin mengubah kata sandi akun Anda.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kata Sandi Saat Ini
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-slate-50/50 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-slate-50/50 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-slate-50/50 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TOMBOL SIMPAN */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan Profil</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
