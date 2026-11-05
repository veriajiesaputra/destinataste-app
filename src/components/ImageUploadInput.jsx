import React, { useState, useRef } from 'react';
import { uploadImage } from '../services/api';

/**
 * ImageUploadInput Component
 * Memberikan 2 opsi fleksibel:
 * 1. Unggah berkas asli (JPG, PNG, WebP, GIF, SVG) langsung dari komputer/HP
 * 2. Menggunakan URL gambar online (Unsplash, link eksternal)
 */
export default function ImageUploadInput({
  label = 'Foto',
  sublabel = '',
  value = '',
  onChange,
  token = '',
  aspect = 'landscape', // 'landscape' | 'square' | 'circle'
  required = false,
  placeholder = 'https://images.unsplash.com/...',
  presetAvatars = null,
}) {
  // Mode aktif: jika value berawalan '/uploads/', default ke 'file', jika URL eksternal default ke 'url'
  const isLocalUpload = value && value.startsWith('/uploads');
  const [mode, setMode] = useState(isLocalUpload ? 'file' : 'file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Proses upload file ke backend
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validasi tipe berkas
    if (!file.type.startsWith('image/')) {
      setUploadError('Berkas yang dipilih harus berupa gambar (JPG, PNG, WebP, GIF, SVG)!');
      return;
    }

    // Validasi ukuran (maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran gambar melebihi batas maksimal 10 MB!');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const res = await uploadImage(file, token);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        throw new Error(res.message || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah gambar. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* HEADER: LABEL & TAB OPSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="block text-xs font-bold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {sublabel && <p className="text-[10px] text-slate-400">{sublabel}</p>}
        </div>

        {/* TAB PILIHAN MODE: UPLOAD vs URL */}
        <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold self-start sm:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              mode === 'file'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📁</span>
            <span>Unggah Berkas</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔗</span>
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center justify-between">
          <span>⚠️ {uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError('')}
            className="text-rose-400 hover:text-rose-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODE 1: UNGGAH BERKAS ASLI (FILE PICKER / DRAG & DROP) */}
      {mode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                : isUploading
                ? 'border-emerald-300 bg-emerald-50/30 cursor-wait'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20'
            }`}
          >
            {isUploading ? (
              <div className="py-2 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-emerald-700">
                  Mengunggah berkas gambar ke server...
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                  📷
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Klik untuk pilih berkas <span className="font-normal text-slate-500">atau seret foto ke sini</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Mendukung JPG, JPEG, PNG, WebP, GIF, SVG (Maksimal 10 MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: MASUKKAN LINK URL */}
      {mode === 'url' && (
        <div className="space-y-1">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-white"
          />
          <p className="text-[10px] text-slate-400">
            Tempel URL gambar langsung (misal dari Unsplash, Cloudinary, atau web lain).
          </p>
        </div>
      )}

      {/* PRESET AVATARS (Jika Disediakan, misal di Halaman Profil) */}
      {presetAvatars && presetAvatars.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
            Atau pilih karakter avatar cepat:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {presetAvatars.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onChange(preset)}
                className={`w-8 h-8 rounded-full border-2 overflow-hidden transition cursor-pointer hover:scale-110 ${
                  value === preset
                    ? 'border-emerald-600 ring-2 ring-emerald-300'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
                title={`Pilih Avatar ${idx + 1}`}
              >
                <img src={preset} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PREVIEW GAMBAR TERPILIH */}
      {value && (
        <div className="mt-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`shrink-0 overflow-hidden border border-slate-200 bg-white shadow-xs ${
                aspect === 'circle'
                  ? 'w-12 h-12 rounded-full'
                  : aspect === 'square'
                  ? 'w-12 h-12 rounded-xl'
                  : 'w-20 h-14 rounded-xl'
              }`}
            >
              <img
                src={value}
                alt="Pratinjau Foto"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80';
                }}
              />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {value.startsWith('/uploads/')
                  ? '📁 ' + value.replace('/uploads/', '')
                  : '🔗 Link Gambar'}
              </span>
              <span className="inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.2 rounded-full mt-0.5">
                {value.startsWith('/uploads/') ? 'Berkas Server Lokal' : 'URL Eksternal'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-rose-600 text-xs font-bold p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer shrink-0"
            title="Hapus foto ini"
          >
            ✕ Hapus
          </button>
        </div>
      )}
    </div>
  );
}
