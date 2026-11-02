# FINANCEKORN — Luxury Metallic 3D Financial Platform

Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Three.js / R3F / Drei · Recharts · Prisma + PostgreSQL · Supabase Auth & Storage · Zod

## Setup
1. `cp .env.example .env.local` lalu isi Supabase URL/keys, `DATABASE_URL`, `DIRECT_URL`.
2. Supabase → Authentication → Providers → Email: aktifkan **Confirm email**. Isi Site URL dan Redirect URL (`<SITE_URL>/auth/callback`).
3. Supabase → Storage: buat bucket **avatars** (Public).
4. `npm install` → `npx prisma db push` → `npm run dev`
5. Daftar dengan `albericbarthez@gmail.com`, verifikasi email: role FOUNDER diberikan otomatis oleh server (env `FOUNDER_EMAIL`, wajib email terverifikasi).
6. Produksi (opsional): `UPSTASH_REDIS_REST_URL/TOKEN` untuk rate limit terdistribusi.

## Fitur
Auth (register, verifikasi email, login, remember me, forgot/reset, logout) · RBAC Founder/Admin/User di server · Dashboard (kartu, grafik, insight dari DB) ·
Income/Expense + kategori kustom · Savings (tambah/kurangi, riwayat saldo tabungan sebelum/sesudah) · Savings Goals · Transaksi & Activity Logs (cari, filter, pilih, hapus, hapus semua) ·
Reports + CSV/PDF · Profil + upload/crop avatar (Supabase Storage) · Settings (tema, motion, notifikasi, ganti email/password, logout sesi lain) ·
Founder/Admin Dashboard, manajemen user, audit log append-only, pengaturan sistem · Scene 3D interaktif dengan fallback dan reduced-motion.

## Integritas keuangan
Decimal(18,2), semua perubahan saldo lewat `services/ledger.ts` di DB transaction dengan `SELECT ... FOR UPDATE` pada wallet, snapshot saldo sebelum/sesudah, validasi kepemilikan.

## Perintah
`npm run typecheck` · `npm run build` · `npm run test` · `npm run test:db` (WAJIB database uji) — lihat `docs/TESTING.md`.

## Catatan jujur
Kode ini belum pernah dijalankan end-to-end oleh saya (sandbox tanpa internet, jadi `npm install`, build, dan test tidak bisa dijalankan). Jalankan `npm run typecheck && npm run build` dulu dan laporkan error yang muncul.
