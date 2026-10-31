# Portofolio — Full-Stack Developer

Website portofolio pribadi single-page (Bahasa Indonesia) yang dibangun dengan **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **shadcn/ui**, **Framer Motion**, dan **Prisma (SQLite)**.

![Tech](https://img.shields.io/badge/Next.js-16-black) ![Tech](https://img.shields.io/badge/TypeScript-5-blue) ![Tech](https://img.shields.io/badge/Tailwind-4-emerald) ![Tech](https://img.shields.io/badge/Prisma-SQLite-teal)

---

## Fitur

- **Hero section** dengan animasi, badge ketersediaan, foto profil, dan CTA menuju proyek
- **Statistik singkat** dengan animasi count-up saat di-scroll
- **Tentang Saya** + kartu informasi (lokasi, email, pendidikan, status)
- **Keahlian** dalam 4 kelompok dengan progress bar
- **Proyek** — data tersimpan di database (SQLite via Prisma), lengkap dengan:
  - Pencarian, filter kategori, dan pengurutan
  - CRUD penuh: tambah, edit, hapus (dengan dialog konfirmasi)
  - Upload gambar dari perangkat (otomatis dikompresi di browser) atau tempel URL
  - Badge "Unggulan" dan status proyek (Selesai / Berjalan)
- **Kontak** — email, WhatsApp, lokasi, LinkedIn, dan form mailto
- **Mode gelap/terang** (default gelap), responsif mobile-first, aksesibel (semantik + ARIA)
- SEO dasar: metadata, Open Graph, robots.txt, favicon

## Teknologi

| Layer     | Teknologi                                        |
| --------- | ------------------------------------------------ |
| Framework | Next.js 16 (App Router), React 19, TypeScript 5  |
| Styling   | Tailwind CSS 4, shadcn/ui, lucide-react          |
| Animasi   | Framer Motion                                    |
| Database  | Prisma ORM + SQLite (`db/custom.db`)             |
| Form      | react-hook-form + zod                            |
| Toast     | sonner                                           |

## Menjalankan Project

### Prasyarat

- [Bun](https://bun.sh) v1.1+ (atau Node.js 20+ dengan npm/pnpm — sesuaikan perintahnya)
- Tidak ada service eksternal lain yang dibutuhkan

### Langkah Setup

```bash
# 1. Instal dependensi
bun install

# 2. Siapkan environment (path database sudah relatif, aman untuk mesin mana pun)
cp .env.example .env

# 3. Buat/sinkronkan skema database
bun run db:push

# 4. (Opsional) Isi database dengan 6 proyek contoh
bun run db:seed

# 5. Jalankan server development
bun run dev
```

Buka `http://localhost:3000` di browser.

> **Catatan:** file `db/custom.db` yang sudah berisi 6 proyek contoh ikut disertakan.
> Langkah 3–4 hanya diperlukan jika Anda memulai dari database kosong.

### Skrip Tersedia

| Perintah            | Fungsi                                        |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Jalankan server development di port 3000      |
| `bun run build`     | Build produksi (standalone output)            |
| `bun run start`     | Jalankan hasil build produksi                 |
| `bun run lint`      | Cek kualitas kode dengan ESLint               |
| `bun run db:push`   | Sinkronkan skema Prisma ke database           |
| `bun run db:seed`   | Isi database dengan data contoh (idempotent)  |
| `bun run db:generate`| Generate Prisma Client                       |

## Kustomisasi

Semua identitas situs dikelola terpusat di **satu file**:

```
src/config/profile.ts
```

Ganti nilai di file tersebut untuk mengubah:

- `name`, `monogram` — nama & inisial (hero, navbar, footer, metadata)
- `roleLine`, `tagline` — jabatan dan deskripsi singkat
- `email`, `whatsappLink`, `location` — kontak
- `socials` — tautan GitHub / LinkedIn / Instagram / Email
- `avatar` — foto profil (letakkan di `public/images/`)
- `aboutParagraphs`, `aboutHighlights` — konten bagian Tentang
- `skillGroups` — daftar keahlian & tingkat penguasaan (0–100)
- `PROJECT_CATEGORIES` — kategori filter proyek

Untuk mengubah proyek, cukup gunakan UI situs sendiri (tombol **Tambah Proyek**)
atau edit lewat API — lihat di bawah.

## Struktur Project

```
├── db/custom.db                  # Database SQLite
├── prisma/
│   ├── schema.prisma             # Skema model Project
│   └── seed.ts                   # Data contoh 6 proyek
├── public/
│   └── images/projects/          # Gambar profil & thumbnail proyek
└── src/
    ├── app/
    │   ├── api/projects/         # REST API (GET/POST, GET/PUT/DELETE by id)
    │   ├── layout.tsx            # Metadata, ThemeProvider, Toaster
    │   └── page.tsx              # Halaman tunggal portofolio
    ├── components/
    │   ├── portfolio/            # Komponen UI portofolio (hero, skills, dll.)
    │   └── ui/                   # Komponen shadcn/ui
    ├── config/profile.ts         # ★ Semua identitas & konten situs
    ├── hooks/use-projects.ts     # Hook CRUD data proyek
    └── lib/                      # Prisma client, tipe, utilitas
```

## API

Semua endpoint mengembalikan/menerima JSON.

| Method   | Endpoint              | Fungsi                            |
| -------- | --------------------- | --------------------------------- |
| `GET`    | `/api/projects`       | Daftar proyek (unggulan dulu)     |
| `POST`   | `/api/projects`       | Tambah proyek                     |
| `GET`    | `/api/projects/:id`   | Detail satu proyek                |
| `PUT`    | `/api/projects/:id`   | Ubah proyek (partial update)      |
| `DELETE` | `/api/projects/:id`   | Hapus proyek                      |

Contoh payload `POST` / `PUT`:

```json
{
  "title": "Nama Proyek",
  "description": "Apa yang dibangun dan dampaknya",
  "category": "Web App",
  "techStack": "Next.js, TypeScript",
  "imageUrl": "/images/projects/ecommerce.png",
  "projectUrl": "https://demo.example.com",
  "repoUrl": "https://github.com/username/repo",
  "year": "2025",
  "status": "Selesai",
  "featured": true
}
```

## Deploy

Project dikonfigurasi dengan `output: "standalone"`. Untuk deploy ke VPS/container:

```bash
bun run build
bun run start
```

Pastikan variabel `DATABASE_URL` mengarah ke file SQLite yang persisten.
Untuk platform seperti Vercel, SQLite tidak persisten — migrasikan ke
PostgreSQL (ubah `provider` di `prisma/schema.prisma`) bila perlu.


## Menjalankan di Windows

1. Pastikan Bun sudah terpasang. Instal dari https://bun.sh jika perintah `bun --version` belum dikenali.
2. Ekstrak seluruh project ke folder biasa, misalnya `C:\Users\User\Documents\portofolio`.
3. Jalankan `JALANKAN-PORTOFOLIO-WINDOWS.bat` dengan klik dua kali. Script akan memasang dependency, membuat Prisma Client, menyelaraskan skema database, lalu menjalankan server.
4. Buka http://localhost:3000 di browser.
5. Biarkan jendela terminal tetap terbuka selama website digunakan. Tekan Ctrl+C untuk menghentikan server.

### Jika daftar proyek gagal dimuat

Endpoint `/api/projects` kini menampilkan pesan error yang lebih informatif saat mode development. Buka terminal yang menjalankan aplikasi dan periksa pesan errornya. Database SQLite lokal berada di `db/custom.db`. Jangan menjalankan `prisma migrate reset` atau menghapus file database karena tindakan itu dapat menghapus proyek yang sudah tersimpan.

Untuk menjalankan manual dari CMD pada folder project:

```cmd
bun install
bunx prisma generate
bunx prisma db push
bun dev
```


## Pratinjau dokumen proyek

Tombol ikon mata membuka halaman pratinjau khusus di tab baru. PDF dan format yang didukung browser ditampilkan langsung. Dokumen Office dengan URL publik dapat memakai Microsoft Office Online Viewer. File Office yang diunggah sebagai data URL/database tidak bisa dirender langsung oleh browser tanpa konversi; halaman pratinjau menyediakan unduhan untuk membukanya di aplikasi Office. Tombol download tetap mengunduh file asli.

## Koneksi database Supabase (Prisma)

Proyek ini menggunakan PostgreSQL Supabase. Untuk paket Supabase Free yang memakai IPv4, gunakan **Transaction Pooler** dari menu **Connect** (port `6543`) sebagai `DATABASE_URL`. Jangan memakai URL Direct Connection/Session Pooler port `5432` pada konfigurasi ini.

1. Salin `.env.example` menjadi `.env` di folder utama proyek (sejajar dengan `package.json`).
2. Ambil URL **Transaction Pooler** dari Supabase Dashboard → **Connect**.
3. Gunakan username role Prisma yang dibuat di Supabase, biasanya `prisma.<PROJECT-REF>`, dan password role tersebut.
4. Pastikan URL berisi `?pgbouncer=true&sslmode=require`. Jika password memiliki karakter khusus, URL-encode bagian password.
5. Jalankan `npm install`, lalu `npx prisma validate`, `npx prisma generate`, dan `npx prisma db push`.

File `.env` tidak boleh diunggah ke GitHub. Untuk Vercel, masukkan nilai `DATABASE_URL` yang sama melalui **Project Settings → Environment Variables**. Prisma membaca `.env` saat perintah CLI dijalankan; Next.js juga dapat membaca `.env`. Tidak perlu menduplikasi nilai yang sama ke `.env.local`.

Jika `db push` masih menghasilkan `P1001`, pastikan proyek Supabase berstatus aktif dan uji URL Transaction Pooler yang disalin langsung dari dashboard. Tes port TCP saja belum membuktikan autentikasi PostgreSQL berhasil. Jangan membagikan URL koneksi atau password.
