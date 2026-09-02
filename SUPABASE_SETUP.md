# Panduan Setup Supabase

Aplikasi Mitra Digital Job Sheet membutuhkan Supabase sebagai backend services (Database, Auth, dan Storage). Ikuti langkah-langkah berikut untuk menyiapkan environment Supabase.

## 1. Membuat Project Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Masukkan nama project, password database, dan pilih region terdekat (misal: Singapore).
3. Tunggu hingga proses provision selesai.

## 2. Mendapatkan API Keys
1. Masuk ke **Project Settings** > **API**.
2. Copy `Project URL` dan masukkan ke file `.env` sebagai nilai `VITE_SUPABASE_URL`.
3. Copy `anon` `public` key dan masukkan ke file `.env` sebagai nilai `VITE_SUPABASE_ANON_KEY`.

## 3. Menjalankan SQL Migration
1. Buka **SQL Editor** di dashboard Supabase.
2. Klik **New query** dan copy/paste script SQL untuk pembuatan schema (akan kita buatkan pada tahapan berikutnya, yaitu table `profiles`, `jobsheets`, dll).
3. Run query tersebut.

## 4. Mengatur Auth Providers (Optional)
1. Buka **Authentication** > **Providers**.
2. Pastikan **Email** diaktifkan. Matikan 'Confirm email' untuk keperluan testing/development awal agar lebih mudah membuat user baru.

## 5. Membuat Storage Bucket
1. Buka **Storage** di sidebar.
2. Klik **New bucket**.
3. Buat bucket berikut dan set sebagai **Public** jika diperlukan (untuk assets public):
   - `job-images` (Untuk cover jobsheet, dsb)
   - `student-submissions` (Dokumentasi siswa saat praktik)
   - `profile-images` (Avatar pengguna)
4. Buat Policy (RLS) di tiap bucket sesuai kebutuhan aplikasi (Student hanya bisa akses/upload dokumentasinya sendiri, Teacher bisa lihat semuanya).

## 6. Testing RLS (Row Level Security)
- Pastikan Row Level Security diaktifkan di seluruh table (akan diatur via script SQL migration nantinya).
- Aplikasi akan login sebagai Student/Teacher/Admin, dan Supabase otomatis akan memfilter akses data berdasar Role dan User ID.
