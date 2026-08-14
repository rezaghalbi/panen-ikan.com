# 📘 PANDUAN SERAH TERIMA KLIEN (HANDOVER GUIDE) - PANENQU E-COMMERCE

Dokumen ini adalah panduan praktis untuk melakukan konfigurasi ulang (*re-configuration*) dan serah terima proyek aplikasi **PanenQu** saat diserahkan ke klien.

 Seluruh variabel yang berpotensi berubah saat pindah kepemilikan/hosting telah dipusatkan pada file **`.env`** di `apps/api` dan `apps/web`, sehingga Anda atau klien tidak perlu mengubah kode sumber (*source code*) sama sekali.

---

## 🗂️ DAFTAR ISI
1. [Struktur Environment Variables](#1-struktur-environment-variables)
2. [Panduan Koneksi Database Supabase Baru](#2-panduan-koneksi-database-supabase-baru)
3. [Panduan Konfigurasi Supabase Storage (Foto Produk)](#3-panduan-konfigurasi-supabase-storage-foto-produk)
4. [Panduan Setup Midtrans Payment Gateway](#4-panduan-setup-midtrans-payment-gateway)
5. [Panduan Deployment ke Vercel (Backend & Frontend)](#5-panduan-deployment-ke-vercel-backend--frontend)
6. [Perintah Maintenance & Database Operations](#6-perintah-maintenance--database-operations)

---

## 1. STRUKTUR ENVIRONMENT VARIABLES

Proyek ini menyediakan file template **`.env.example`** pada folder backend dan frontend.

### 🔹 Backend (`apps/api/.env`)
Salin file `apps/api/.env.example` menjadi `apps/api/.env`:

```env
# 1. DATABASE SUPABASE / POSTGRES
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# 2. SUPABASE STORAGE FOTO PRODUK
SUPABASE_URL="https://[YOUR_SUPABASE_REF].supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
SUPABASE_BUCKET="products"

# 3. MIDTRANS PAYMENT GATEWAY
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"
MIDTRANS_IS_PRODUCTION="false" # "false" untuk Sandbox, "true" untuk Live Production

# 4. SECURITY & AUTH
JWT_SECRET="ganti-dengan-kode-rahasia-klien"
JWT_EXPIRES_IN="7d"

# 5. SERVER & CORS DYNAMIC ORIGIN
PORT=8000
FRONTEND_URL="http://localhost:3000,https://panenqu-klien.vercel.app"
```

### 🔹 Frontend (`apps/web/.env.local`)
Salin file `apps/web/.env.example` menjadi `apps/web/.env.local`:

```env
# API Backend URL (Ganti dengan URL backend Vercel klien)
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Midtrans Client Key (Client Side Snap Popup)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"
NEXT_PUBLIC_MIDTRANS_SNAP_URL="https://app.sandbox.midtrans.com/snap/snap.js"
```

---

## 2. PANDUAN KONEKSI DATABASE SUPABASE BARU

Jika klien ingin menggunakan akun Supabase milik mereka sendiri:

1. Buka [Supabase Dashboard](https://database.new) dan buat **Project Baru**.
2. Masuk ke menu **Project Settings** ➔ **Database**.
3. Cari bagian **Connection String**:
   - Pilih tab **Transaction (PGBouncer)** (Port `6543`) ➔ Salin ke `DATABASE_URL` di `apps/api/.env`.
   - Pilih tab **Direct Connection** (Port `5432`) ➔ Salin ke `DIRECT_URL` di `apps/api/.env`.
4. Jalankan perintah migrasi dan seed data dari folder `apps/api`:
   ```bash
   cd apps/api
   npx prisma db push
   npx prisma db seed
   ```

---

## 3. PANDUAN KONFIGURASI SUPABASE STORAGE (FOTO PRODUK)

1. Di Supabase Dashboard klien, masuk ke menu **Storage** ➔ **Buckets**.
2. Buat Bucket Baru bernama **`products`**.
3. Pastikan Opsi **Public Bucket** dicentang (**ON**) agar gambar produk dapat diakses secara publik.
4. Masuk ke **Project Settings** ➔ **API**:
   - Salin **Project URL** ➔ Tempel pada `SUPABASE_URL` di `.env`.
   - Salin **`anon` `public` key** ➔ Tempel pada `SUPABASE_KEY` di `.env`.

---

## 4. PANDUAN SETUP MIDTRANS PAYMENT GATEWAY

1. Buat / Login Akun di [Dashboard Midtrans](https://dashboard.midtrans.com/).
2. Untuk pengujian awal gunakan mode **SANDBOX**; jika sudah siap terima uang nyata, beralih ke mode **PRODUCTION**.
3. Masuk ke menu **Settings** ➔ **Access Keys**:
   - Salin **Server Key** ➔ Tempel pada `MIDTRANS_SERVER_KEY` di `apps/api/.env`.
   - Salin **Client Key** ➔ Tempel pada `MIDTRANS_CLIENT_KEY` di `apps/api/.env` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` di `apps/web/.env.local`.
4. Masuk ke menu **Settings** ➔ **Configuration**:
   - Set **Payment Notification URL** ke endpoint backend:
     `https://[URL-BACKEND-KLIEN]/api/orders/notification`
   - Set **Finish Redirect URL** ke: `https://[URL-FRONTEND-KLIEN]/user/orders`
5. Jika sudah live di Production:
   - Ubah `MIDTRANS_IS_PRODUCTION="true"` pada `.env` backend.
   - Ubah `NEXT_PUBLIC_MIDTRANS_SNAP_URL="https://app.midtrans.com/snap/snap.js"` pada `.env.local` frontend.

---

## 5. PANDUAN DEPLOYMENT KE VERCEL (BACKEND & FRONTEND)

### A. Deploy Backend (`apps/api`)
1. Import repository ke Vercel.
2. Atur **Root Directory** ke: `apps/api`.
3. Masukkan seluruh **Environment Variables** dari `apps/api/.env` pada panel Vercel Settings.
4. Set `FRONTEND_URL` ke domain frontend Vercel yang dihasilkan.

### B. Deploy Frontend (`apps/web`)
1. Import repository ke Vercel (Project terpisah).
2. Atur **Root Directory** ke: `apps/web`.
3. Masukkan Environment Variables:
   - `NEXT_PUBLIC_API_URL` = URL Backend Vercel dari langkah A.
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` = Client key Midtrans klien.
   - `NEXT_PUBLIC_MIDTRANS_SNAP_URL` = URL Snap.js.

---

## 6. PERINTAH MAINTENANCE & DATABASE OPERATIONS

| Perintah | Deskripsi |
| :--- | :--- |
| `npx prisma db push` | Sinkronisasi skema database ke Supabase tanpa membuat file histori migrasi. |
| `npx prisma db seed` | Menjalankan seeding ulang data produk contoh PanenQu & user admin/customer. |
| `npx prisma studio` | Membuka antarmuka GUI browser untuk melihat dan mengedit data tabel database. |

---
*Dokumen disiapkan untuk kemudahan serah terima proyek PanenQu E-Commerce.*
