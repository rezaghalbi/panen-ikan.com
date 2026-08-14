# 🚀 PANDUAN LENGKAP DEPLOYMENT & KONFIGURASI PANENQU E-COMMERCE

Panduan visual dan teknis mendetail untuk mengkonfigurasi **Supabase**, **Vercel (Backend & Frontend)**, **Midtrans Payment Gateway**, serta **Populasi Data Awal (Seeding)**.

---

## 📋 DAFTAR TAHAPAN DEPLOYMENT

```mermaid
graph TD
    A[1. Supabase Database] -->|Connection String| B[2. Deploy Backend di Vercel]
    B -->|URL Backend| C[3. Deploy Frontend di Vercel]
    C -->|URL Frontend| D[4. Set Notifikasi Webhook Midtrans]
    B -->|Prisma Seed| E[5. Aplikasi Live & Siap Digunakan]
```

---

## 1. KONFIGURASI SUPABASE DATABASE & STORAGE

### A. Mengambil Connection String Database
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) ➔ Pilih Project **`panen-ikan`**.
2. Masuk ke **Project Settings** (ikon gerigi di bilah menu paling bawah) ➔ Klik **Database**.
3. Gulir ke bagian **Connection String**:
   - Tab **Transaction (Port 6543 / PGBouncer)**:
     ```env
     postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true
     ```
     👉 *Gunakan string ini untuk variabel `DATABASE_URL`.*
   
   - Tab **Direct Connection (Port 5432)**:
     ```env
     postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres
     ```
     👉 *Gunakan string ini untuk variabel `DIRECT_URL`.*

   *(Catatan: Ganti `[PASSWORD]` dengan password database yang Anda tentukan saat membuat project).*

### B. Membuat Bucket Storage Foto Produk
1. Di Supabase Dashboard, masuk ke menu **Storage** (ikon kubus di menu kiri) ➔ Klik **Create a new bucket**.
2. Isikan Nama Bucket: **`products`**.
3. Sakelar **Public bucket**: Aktifkan ke **ON** (hijau) agar gambar produk bisa diakses pengunjung web.
4. Klik **Save**.
5. Masuk ke **Project Settings** ➔ **API**:
   - Salin **Project URL** ➔ Ini untuk `SUPABASE_URL`.
   - Salin **`anon` `public` API Key** ➔ Ini untuk `SUPABASE_KEY`.

---

## 2. DEPLOYMENT BACKEND API (`apps/api`) DI VERCEL

1. Buka [Vercel New Project](https://vercel.com/new).
2. Cari repository **`rezaghalbi/panen-ikan.com`** ➔ Klik **Import**.
3. Konfigurasi Project Backend:
   - **Project Name**: `panen-ikan-api`
   - **Framework Preset**: *Other / Node.js*
   - **Root Directory**: Klik *Edit* ➔ Pilih folder **`apps/api`** ➔ Klik *Continue*.
4. Masukkan **Environment Variables**:

| Variable Key | Nilai / Value Contoh | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.xxx:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true` | String Transaction Supabase |
| `DIRECT_URL` | `postgresql://postgres.xxx:pass@db.xxx.supabase.co:5432/postgres` | String Direct Supabase |
| `SUPABASE_URL` | `https://xxxxxx.supabase.co` | URL Project Supabase |
| `SUPABASE_KEY` | `eyJhbGciOiJKV1QiLC...` | Anon Key Supabase |
| `SUPABASE_BUCKET` | `products` | Nama Bucket Storage |
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-xxxxxxxx` | Server Key Midtrans |
| `MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxxxxxxx` | Client Key Midtrans |
| `MIDTRANS_IS_PRODUCTION`| `false` | `false` untuk Sandbox, `true` untuk Production |
| `JWT_SECRET` | `panenqu-secret-key-2026` | Kunci Enkripsi Token Login |
| `FRONTEND_URL` | `*` | Diizinkan diakses dari semua Origin |

5. Klik **Deploy**.
6. Setelah deployment berhasil, Vercel akan memberikan **URL Domain Backend API** (misal: `https://panen-ikan-api.vercel.app`). **Salin URL ini!**

---

## 3. DEPLOYMENT FRONTEND WEBSITE (`apps/web`) DI VERCEL

1. Buka kembali [Vercel New Project](https://vercel.com/new).
2. Impor kembali repository **`rezaghalbi/panen-ikan.com`** (sebagai project terpisah).
3. Konfigurasi Project Frontend:
   - **Project Name**: `panen-ikan-web`
   - **Framework Preset**: *Next.js*
   - **Root Directory**: Klik *Edit* ➔ Pilih folder **`apps/web`** ➔ Klik *Continue*.
4. Masukkan **Environment Variables**:

| Variable Key | Nilai / Value Contoh | Keterangan |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://panen-ikan-api.vercel.app` | **URL Backend dari Langkah 2** |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxxxxxxx` | Client Key Midtrans |
| `NEXT_PUBLIC_MIDTRANS_SNAP_URL` | `https://app.sandbox.midtrans.com/snap/snap.js` | Script Snap Popup Midtrans |

5. Klik **Deploy**.
6. Setelah selesai, Vercel akan memberikan **URL Website Publik** (misal: `https://panen-ikan-web.vercel.app`).

---

## 4. INTEGRASI NOTIFIKASI MIDTRANS PAYMENT GATEWAY

1. Login ke [Dashboard Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/) (atau Production jika sudah disetujui).
2. Masuk ke **Settings** ➔ **Configuration**:
   - **Payment Notification URL**: Isikan URL webhook backend Vercel Anda:
     ```text
     https://panen-ikan-api.vercel.app/api/orders/notification
     ```
   - **Finish Redirect URL**: Isikan URL halaman pesanan pengguna:
     ```text
     https://panen-ikan-web.vercel.app/user
     ```
   - **Unfinish Redirect URL**: `https://panen-ikan-web.vercel.app/cart`
   - **Error Redirect URL**: `https://panen-ikan-web.vercel.app/cart`
3. Klik **Save Changes**.

---

## 5. MENGISI DATA KATALOG AWAL (DATABASE SEEDING)

Agar database Supabase baru Anda langsung terisi dengan data contoh produk ikan segar, fillet frozen, dan akun Admin/Customer:

### Jalankan Seeding dari Komputer Lokal:
1. Buka terminal di folder proyek lokal Anda.
2. Edit file `apps/api/.env` lokal, pasang `DATABASE_URL` dan `DIRECT_URL` Supabase baru Anda.
3. Jalankan perintah migrasi & seed:
   ```bash
   cd apps/api
   npx prisma db push
   npx prisma db seed
   ```
4. 🎉 **Selamat!** Seluruh produk ikan segar khas PanenQu beserta akun Admin (`admin@panenqu.com` / `password123`) dan Customer (`budi@gmail.com` / `password123`) kini telah aktif di database live Anda!

---

## 🔑 CHECKLIST VERIFIKASI AKHIR

- [x] Repository GitHub: [rezaghalbi/panen-ikan.com](https://github.com/rezaghalbi/panen-ikan.com)
- [ ] Database Supabase terhubung (`DATABASE_URL` & `DIRECT_URL`).
- [ ] Backend API Live di Vercel (`https://panen-ikan-api.vercel.app`).
- [ ] Frontend Web Live di Vercel (`https://panen-ikan-web.vercel.app`).
- [ ] Seeder produk & kategori sukses di-push ke database.
