# 🚀 Panduan Kolaborasi Tim DestinaTaste
> Panduan standar untuk tim **Frontend**, **Backend**, dan **DevOps** dalam mengembangkan proyek DestinaTaste bersama di laptop masing-masing.

---

## 🛠️ 1. Setup Awal di Laptop Masing-Masing (Cukup 1 Kali)

Setiap anggota tim yang baru pertama kali bergabung, jalankan langkah berikut di terminal:

### Langkah A: Clone Repositori
```bash
git clone https://github.com/23215022-Imzy/destinataste.git
cd destinataste
```

### Langkah B: Pasang Dependensi (Frontend & Backend)
```bash
# 1. Pasang dependensi frontend di folder utama
npm install

# 2. Pasang dependensi backend
cd server
npm install
cd ..
```

### Langkah C: Konfigurasi File Environment (.env)
Salin template environment yang sudah disiapkan:
```bash
# Untuk Frontend (di folder root)
cp .env.example .env

# Untuk Backend (di dalam folder server)
cp server/.env.example server/.env
```
> **Catatan:** Sesuaikan `DB_PASSWORD` dan konfigurasi database MySQL di `server/.env` jika diperlukan.

---

## 💻 2. Cara Menjalankan Aplikasi di Laptop

Pastikan MySQL (misal dari **Laragon** atau **XAMPP**) sudah dalam status aktif/START.

### Menjalankan Backend:
Buka Terminal 1:
```bash
cd server
node index.js
```
*Server API & AI Engine akan berjalan di: `http://localhost:5000`*

### Menjalankan Frontend:
Buka Terminal 2:
```bash
npm run dev
```
*Aplikasi web akan berjalan di: `http://localhost:5173`*

---

## 🌿 3. Aturan Git & Alur Kerja Tim (Git Workflow)

Untuk menjaga kode di branch `main` selalu stabil dan tidak bentrok (*conflict*), ikuti aturan ini:

### ⚠️ PERATURAN UTAMA:
1. **DILARANG LANGSUNG `git push` KE BRANCH `main`!**
2. Setiap tugas baru harus dikerjakan di branch terpisah.

---

### Alur Langkah Mengerjakan Fitur:

#### 1. Selalu Tarik Kode Terbaru Sebelum Mulai
```bash
git checkout main
git pull origin main
```

#### 2. Buat Branch Baru untuk Tugas Anda
Gunakan penamaan branch yang jelas:
- Fitur baru: `feature/nama-fitur`
- Perbaikan bug: `fix/nama-bug`

Contoh:
```bash
# Contoh untuk tim Frontend:
git checkout -b feature/halaman-faq

# Contoh untuk tim Backend:
git checkout -b feature/api-notifikasi
```

#### 3. Kerjakan Kode dan Commit Berkala
```bash
git add .
git commit -m "feat(ui): tambahkan komponen accordion FAQ"
```

#### 4. Push Branch Anda ke GitHub
```bash
git push -u origin feature/halaman-faq
```

#### 5. Buat Pull Request (PR) di GitHub
1. Buka repo di browser: `https://github.com/23215022-Imzy/destinataste`
2. Klik tombol hijau **Compare & pull request**.
3. Tulis ringkasan singkat apa yang diubah.
4. Tunggu sistem **GitHub Actions (CI)** mengecek build apakah ada error atau tidak.
5. **DevOps / Reviewer** akan me-review dan melakukan **Merge** ke `main`.

---

## 🐳 4. Opsi Menjalankan dengan Docker (DevOps Way)

Jika tidak ingin ribet install MySQL atau Node secara manual di laptop:
```bash
# Jalankan seluruh stack (Database, Backend, Frontend)
docker compose up -d

# Hentikan seluruh stack
docker compose down
```

---

## 👥 Akun Bawaan untuk Uji Coba:
- **Admin**: `admin@destinataste.com` (Sandi: `admin123`)
- **Pengguna**: `budi@gmail.com` (Sandi: `user123`)
