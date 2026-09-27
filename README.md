# ASN Pintar — Full-Stack Source Code

Aplikasi pelatihan digital ASN. Paket ini adalah **kerangka produksi** (bukan lagi prototipe
demo) yang dirancang agar tim IT internal dapat men-deploy ke server sungguhan dan diakses
publik oleh seluruh ASN di instansi.

> Companion prototipe interaktif (UI/UX lengkap, tanpa backend) sudah pernah dibuat terpisah
> untuk keperluan demo/presentasi. Paket ini adalah implementasi nyatanya.

## Arsitektur

```
                    ┌─────────────────────┐
   Browser/Mobile ──┤  Frontend (React)   │  Nginx, static build
                    └─────────┬───────────┘
                              │ HTTPS / REST JSON
                    ┌─────────▼───────────┐
                    │  Backend API        │  Node.js + Express + TypeScript
                    │  (JWT auth, RBAC)   │
                    └─────────┬───────────┘
                              │ Prisma ORM
                    ┌─────────▼───────────┐
                    │  PostgreSQL         │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │  Jitsi Meet (self-   │  Live class / webinar
                    │  hosted, terpisah)   │  (lihat bagian Jitsi)
                    └──────────────────────┘
```

- **Backend**: Node.js 20 + Express + TypeScript + Prisma ORM + PostgreSQL. Autentikasi JWT,
  otorisasi berbasis peran (`peserta` / `admin`).
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS, mengonsumsi backend via REST API.
- **Video conference**: terintegrasi ke server **Jitsi Meet self-hosted** milik instansi
  (deployment Jitsi terpisah dari repo ini — lihat `docs/jitsi-setup.md` di bawah).
- **Sertifikat digital**: dihasilkan sebagai PDF dengan kode QR verifikasi (library `qrcode`
  + `pdfkit`), disimpan di server dan dapat diunduh/dicetak.
- **Integrasi SIASN/SAPK BKN**: repo ini menyediakan titik ekstensi (`backend/src/lib/siasn.ts`
  — file yang sengaja dikosongkan sebagai stub) karena integrasi resmi memerlukan kredensial
  API dan perjanjian kerja sama dengan BKN yang tidak tersedia untuk kami buatkan di sini.

## Modul yang sudah diimplementasikan di backend

| Modul | Status |
|---|---|
| Auth (register/login JWT, role peserta/admin) | ✅ |
| Manajemen kelas & modul microlearning | ✅ |
| Progres belajar & perhitungan JP otomatis | ✅ |
| Pre-test / Post-test (skor otomatis) | ✅ |
| Simulasi CAT (kategori teknis/manajerial/sosio-kultural) | ✅ |
| Sertifikat digital PDF + QR verifikasi | ✅ |
| Forum diskusi | ✅ |
| Mentoring & penjadwalan sesi | ✅ |
| Live class terintegrasi Jitsi (buat room + link) | ✅ |
| Gamifikasi (poin, lencana, leaderboard) | ✅ |
| Dashboard admin & kepatuhan JP | ✅ |
| Ekspor laporan CSV | ✅ |
| Mode offline (unduh materi) | 🟡 stub — lihat catatan di bawah |
| Integrasi SIASN/SAPK BKN | 🟡 stub — butuh kredensial resmi BKN |
| Rekomendasi AI (competency gap) | ✅ versi rule-based; siap diganti model ML |

🟡 = kerangka & titik integrasi sudah disiapkan, implementasi penuh memerlukan input eksternal
(kredensial API resmi, atau keputusan produk lebih lanjut) yang tidak bisa kami asumsikan sendiri.

## Menjalankan secara lokal (development)

Prasyarat: Docker & Docker Compose terpasang.

```bash
cp .env.example .env
# sunting .env sesuai kebutuhan (JWT_SECRET, dsb.)
docker compose up --build
```

- Backend API: http://localhost:4000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

Seed data contoh (mirip prototipe demo) otomatis dijalankan saat kontainer backend pertama
kali start (`prisma/seed.ts`).

Akun contoh setelah seeding:
- Peserta: `dewi@instansi.go.id` / `password123`
- Admin: `admin@instansi.go.id` / `password123`

## Deployment ke server produksi

1. **Siapkan server** (VPS/cloud, Ubuntu 22.04 disarankan) dengan Docker & Docker Compose,
   domain (mis. `asnpintar.instansi-anda.go.id`) yang sudah diarahkan ke IP server.
2. **Reverse proxy + HTTPS**: gunakan Nginx/Caddy/Traefik di depan `frontend` dan `backend`,
   dengan sertifikat TLS (Let's Encrypt via Certbot atau Caddy otomatis).
3. Salin repo ke server, isi `.env` produksi (JWT secret kuat, kredensial database, domain
   Jitsi, dsb.), lalu:
   ```bash
   docker compose -f docker-compose.yml up --build -d
   ```
4. Jalankan migrasi database: `docker compose exec backend npx prisma migrate deploy`.
5. **Backup rutin** database PostgreSQL (`pg_dump` terjadwal via cron) — wajib untuk data
   kepegawaian.
6. **Jitsi Meet self-hosted**: deploy terpisah mengikuti panduan resmi
   `docker-jitsi-meet` (https://github.com/jitsi/docker-jitsi-meet), lalu set
   `JITSI_DOMAIN` di `.env` backend agar tautan live class dibuat mengarah ke server tersebut.
   Disarankan mengaktifkan JWT auth Jitsi (`ENABLE_AUTH`, `ENABLE_GUESTS`) agar hanya pengguna
   yang login di ASN Pintar dapat membuat/masuk ruang kelas — lihat `docs/jitsi-setup.md`.
7. **Mode offline**: untuk dukungan wilayah 3T secara penuh, tahap lanjut yang disarankan
   adalah membungkus frontend sebagai PWA (Progressive Web App) dengan service worker yang
   meng-cache materi yang sudah diunduh peserta. Kerangka ini belum menyertakan service worker
   — ini keputusan implementasi yang sebaiknya dipetakan bersama tim IT (berapa besar materi
   yang perlu di-cache, kebijakan retensi penyimpanan perangkat, dsb.) sebelum dibangun.

## Struktur folder

```
asn-pintar-fullstack/
├── docker-compose.yml
├── .env.example
├── backend/            → Express API + Prisma + PostgreSQL
│   ├── prisma/schema.prisma   → skema seluruh entitas data
│   ├── prisma/seed.ts         → data contoh
│   └── src/
│       ├── routes/            → satu file per modul fitur
│       ├── middleware/        → auth JWT & role guard
│       └── lib/                → sertifikat PDF/QR, Jitsi, JP, stub SIASN
└── frontend/           → React + Vite + Tailwind
    └── src/pages/              → satu halaman per modul fitur
```

## Keamanan & kepatuhan (wajib diperhatikan tim IT sebelum go-live)

- Ganti seluruh nilai `.env.example` sebelum produksi, terutama `JWT_SECRET` dan kredensial DB.
- Data kepegawaian (NIP, jabatan, riwayat pelatihan) adalah **data pribadi** — pastikan
  transmisi selalu HTTPS, backup terenkripsi, dan akses admin dibatasi sesuai kebijakan
  instansi/BKPSDM serta regulasi perlindungan data pribadi yang berlaku.
- Lakukan audit keamanan (dependency scanning, penetration test dasar) sebelum digunakan
  untuk data ASN sungguhan — kerangka ini adalah titik awal, bukan hasil audit keamanan.
