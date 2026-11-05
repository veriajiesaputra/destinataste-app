# DestinaTaste — Eksplorasi Wisata & Kuliner Tegal

Aplikasi web modern untuk mengeksplorasi destinasi wisata alam, budaya, dan kuliner khas Tegal (Kota & Kabupaten Tegal, Jawa Tengah). Terintegrasi penuh antara frontend **React 19 (Vite + Tailwind CSS)**, backend **REST API (Node.js Express + JWT)**, database relasional **MySQL (Laragon)**, serta kecerdasan buatan **DestinaTaste AI**.

---

## 🌟 Fitur Utama & Lanjutan

### 1. ❤️ Wishlist / Destinasi Favorit (`/favorit`)
- Pengguna yang masuk dapat menyimpan dan menghapus destinasi favorit dengan mengklik tombol ikon hati ❤️ pada kartu destinasi atau halaman detail.
- Halaman khusus `/favorit` untuk melihat daftar koleksi tempat liburan dan kuliner impian yang siap dikunjungi lengkap dengan filter tipe.

### 2. 🗓️ AI Itinerary Generator (`/itinerary`)
- Generator rencana perjalanan otomatis yang ditenagai oleh **DestinaTaste AI**.
- Kustomisasi durasi: 1 Hari (*One Day Trip*), 2 Hari 1 Malam (*Weekend Getaway*), atau 3 Hari 2 Malam (*Jelajah Lengkap*).
- Pilihan gaya perjalanan (*Santai & Kuliner, Wisata Alam & Petualangan, Wisata Keluarga, Backpacker Hemat*), tingkat anggaran, dan catatan khusus.
- Rute disusun secara logis berdasarkan kedekatan geografis destinasi Tegal disertai estimasi biaya, tips penting, dan tombol cetak/simpan PDF.

### 3. 📸 Unggah Foto Pengalaman & Lightbox Galeri
- Wisatawan dapat melampirkan URL foto pengalaman saat menulis ulasan di halaman detail destinasi.
- Menampilkan thumbnail foto pada ulasan dan galeri foto wisatawan di bagian atas ulasan.
- Dilengkapi **modal Lightbox** untuk melihat foto pengalaman dalam resolusi penuh.

### 4. 📊 Ekspor Laporan CSV & Moderasi Ulasan Admin (`/admin`)
- **Ekspor CSV Destinasi**: Download data seluruh destinasi (ID, Nama, Kategori, Harga, Rating, Jam Buka) sekali klik.
- **Ekspor CSV Ulasan**: Download seluruh feedback dan ulasan wisatawan dalam format spreadsheet CSV.
- **Tabel Moderasi Ulasan**: Admin dapat memantau seluruh ulasan, memfilter berdasarkan rating bintang atau pencarian teks, melihat preview foto, dan menghapus komentar yang tidak pantas.

### 5. 🤖 DestinaTaste AI Chatbot
- Asisten pemandu wisata dan kuliner khas Tegal yang interaktif di pojok kanan bawah aplikasi.
- **Keamanan & Privasi**: Akses percakapan khusus untuk pengguna terdaftar yang sudah login (`pengguna` dan `admin`).
- **Grounded Database**: Memberikan rekomendasi akurat berbasis 24 destinasi resmi Tegal di database MySQL.
- **Clean White-label Branding**: Tampilan bersih tanpa watermark atau embel-embel pihak ketiga, dengan konfigurasi API key aman di sisi backend.

---

## 👥 Sistem 3 Role

1. **👁️ Pengunjung (Guest)**:
   - Dapat menjelajahi seluruh destinasi wisata & kuliner Tegal.
   - Dapat mencari destinasi dan membaca ulasan.
   - Diarahkan untuk login/register saat ingin menggunakan DestinaTaste AI, menyimpan favorit, atau menulis ulasan.

2. **👤 Pengguna (User)**:
   - Pengguna terdaftar yang telah login.
   - Akses penuh ke DestinaTaste AI Chatbot dan AI Itinerary Generator.
   - Dapat menandai destinasi favorit ❤️ dan mengelola wishlist di `/favorit`.
   - Dapat memberikan penilaian bintang (1-5), menulis ulasan, dan melampirkan foto pengalaman.

3. **👑 Admin (Administrator)**:
   - Akses penuh ke **Dashboard Admin** (`/admin`).
   - Tambah, edit, dan hapus data destinasi serta koordinat GPS peta.
   - Moderasi ulasan pengunjung dan kelola keluhan.
   - Ekspor laporan data destinasi dan data ulasan ke format CSV.

---

## 🔑 Akun Demo Siap Pakai

| Role | Email | Password |
|---|---|---|
| **👑 Admin** | `admin@destinataste.com` | `admin123` |
| **👤 Pengguna** | `budi@gmail.com` | `user123` |
| **👤 Pengguna 2** | `siti@gmail.com` | `user123` |

*(Di halaman `/login` tersedia tombol **Login Cepat** sekali klik untuk Pengguna & Admin)*.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Leaflet, React-Leaflet
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv
- **Database**: MySQL 8.0 (Laragon) dengan driver `mysql2` (Connection Pool & Promises)
- **AI Engine**: Google Gemini API via Secure REST Backend

---

## 🚀 Cara Menjalankan Project

### 1. Pastikan MySQL Laragon Aktif
Buka Laragon dan pastikan service **MySQL** sudah berjalan (klik tombol *Start All* di panel Laragon).

### 2. Jalankan Frontend & Backend Sekaligus
Di root direktori project (`C:\laragon\www\destinate`), jalankan:

```bash
npm run dev:all
```

Aplikasi akan berjalan di:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
