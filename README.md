# SMA An-Nuriyyah Bumiayu - Website Sekolah

Website resmi SMA An-Nuriyyah Bumiayu dengan CMS untuk mengelola artikel, pengumuman, pendaftaran siswa baru, dan konten sekolah lainnya.

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes (full-stack)
- **Database**: Turso (libSQL / SQLite remote)
- **Auth**: JWT (JSON Web Token)
- **Rich Text Editor**: Lexical
- **Image/PDF Upload**: Cloudinary (production) / Local (development)
- **Styling**: CSS Custom Properties + Framer Motion

## Fitur

- Beranda dengan hero slider, profil sekolah, program unggulan
- Blog/artikel dengan kategori dan editor rich text
- Pengumuman dengan countdown global, upload PDF, tabel data CSV, dan pencarian realtime
- Form pendaftaran siswa baru (SPMB)
- CMS Dashboard untuk mengelola:
  - Artikel & kategori
  - Pengumuman (dengan Lexical editor, upload PDF & CSV, countdown)
  - Pendaftaran siswa baru
  - Laporan kegiatan
  - Manajemen user (admin & penulis)
- Autentikasi JWT dengan role-based access

## Quick Start

```bash
# Clone repository
git clone https://github.com/smaannuriyyah-source/smanuby1.git
cd smanuby1

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Initialize database (create tables & default admin)
npm run db:init

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Environment Variables

Buat file `.env` berdasarkan `.env.example`:

| Variable | Description | Required |
|----------|-------------|----------|
| `TURSO_DB_URL` | Turso database URL (`libsql://...turso.so`) | Yes |
| `TURSO_DB_AUTH_TOKEN` | Turso auth token | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key (chatbot) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No (local upload fallback) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No |

## Database

Menggunakan [Turso](https://turso.tech) (libSQL / SQLite remote). Tabel dibuat otomatis saat pertama kali API diakses, atau manual via:

```bash
npm run db:init
```

## Default Admin

- **Username**: `admin`
- **Password**: `admin`

> ⚠️ Ganti password default setelah login pertama!

## Deploy ke Vercel

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import repository
3. Set environment variables di Vercel Dashboard:
   - `TURSO_DB_URL`
   - `TURSO_DB_AUTH_TOKEN`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME` (opsional)
   - `CLOUDINARY_API_KEY` (opsional)
   - `CLOUDINARY_API_SECRET` (opsional)
4. Deploy — database akan auto-initialize saat pertama kali diakses

## Project Structure

```
src/
├── app/
│   ├── api/              # API Routes (backend)
│   │   ├── announcements/ # CRUD pengumuman
│   │   ├── articles/      # CRUD artikel
│   │   ├── auth/          # Login, logout, me
│   │   ├── categories/    # CRUD kategori
│   │   ├── dashboard/     # Stats
│   │   ├── profile/       # Profile & password
│   │   ├── public/        # Public endpoints
│   │   ├── registrations/ # SPMB registrations
│   │   ├── reports/       # CRUD laporan
│   │   ├── upload/        # File upload
│   │   └── users/         # CRUD users
│   ├── dashboard/         # CMS pages
│   ├── pengumuman/        # Public pengumuman page
│   ├── layout.js          # Root layout
│   └── page.js            # Homepage
├── components/            # React components
├── data/rag-data/          # RAG knowledge base
├── lib/
│   ├── auth.js             # JWT auth utilities
│   ├── db.js               # Turso database client
│   ├── db-init.js          # Database init script
│   └── upload.js           # Cloudinary/local upload
├── middleware.js           # Auto DB init middleware
└── public/
    └── images/             # Static images
```

## License

MIT