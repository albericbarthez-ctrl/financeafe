# Pengujian (Fase 7)
## Otomatis
- `npm run test` — aturan izin per role (Founder/Admin/User) dan pembatasan query.
- `npm run test:db` — ledger (saldo, penolakan, transaksi paralel). WAJIB pakai database uji.
- `npm run typecheck` dan `npm run build` — harus bersih sebelum rilis.
## Manual — izin role (3 akun: Founder, Admin, User)
1. User membuka /founder, /founder/audit, /founder/logs, /founder/system → dialihkan ke /dashboard.
2. Admin membuka /founder/audit dan /founder/system → dialihkan; Admin tidak melihat total transaksi/tabungan.
3. Admin mencoba suspend Admin lain/Founder → ditolak. Founder tidak bisa diubah/dihapus siapa pun.
4. User A tidak dapat melihat/menghapus transaksi User B (ubah id di request → "tidak ditemukan").
## Manual — keamanan
- 7 login salah berturut-turut → rate limit. Upload file .exe berekstensi .png → ditolak.
- CSV ekspor: nilai berawalan = + - @ diberi tanda kutip.
## Responsif & performa
- Cek lebar 360, 768, 1280, 1920 px: sidebar drawer, tabel scroll horizontal, tombol ≥ 40 px.
- Lighthouse (Chrome DevTools) pada /login dan /dashboard: target Performance ≥ 80 di mode mobile.
- Aktifkan "Reduce motion" di OS → animasi mati, scene 3D tidak berputar terus.
