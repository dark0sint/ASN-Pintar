# Menyiapkan Jitsi Meet Self-Hosted untuk ASN Pintar

ASN Pintar tidak menyertakan server Jitsi di dalam `docker-compose.yml`-nya — Jitsi Meet
adalah proyek besar dengan komponennya sendiri (web, prosody/XMPP, jicofo, jitsi-videobridge),
resminya didistribusikan sebagai repo terpisah dan idealnya di-deploy di server/subdomain
tersendiri (mis. `meet.instansi-anda.go.id`) agar bisa diskalakan independen dari ASN Pintar.

## 1. Deploy Jitsi Meet

Ikuti panduan resmi: https://github.com/jitsi/docker-jitsi-meet

Ringkas:
```bash
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet
cp env.example .env
./gen-passwords.sh
docker compose up -d
```
Atur `.env` Jitsi: `PUBLIC_URL=https://meet.instansi-anda.go.id`, lalu pasang reverse proxy
TLS (Nginx/Caddy) di depan port yang diekspos Jitsi.

## 2. (Disarankan untuk produksi) Aktifkan JWT auth di Jitsi

Tanpa autentikasi, siapa pun yang tahu nama room dapat bergabung — cukup untuk uji coba
tetapi tidak ideal untuk kelas resmi ASN. Untuk membatasi hanya pengguna ASN Pintar yang
sudah login:

1. Di `docker-jitsi-meet/.env`, set:
   ```
   ENABLE_AUTH=1
   ENABLE_GUESTS=1
   AUTH_TYPE=jwt
   JWT_APP_ID=asnpintar
   JWT_APP_SECRET=<buat_secret_acak_yang_panjang>
   ```
2. Restart Jitsi: `docker compose down && docker compose up -d`.
3. Di `.env` **backend ASN Pintar**, isi:
   ```
   JITSI_DOMAIN=meet.instansi-anda.go.id
   JITSI_APP_ID=asnpintar
   JITSI_APP_SECRET=<secret_yang_sama_persis_dengan_di_atas>
   ```

Dengan konfigurasi ini, `backend/src/lib/jitsi.ts` otomatis menandatangani token JWT setiap
kali peserta/admin membuat atau bergabung ke room, sehingga hanya pengguna yang sudah
terautentikasi di ASN Pintar yang bisa masuk.

## 3. Tanpa JWT (mode sederhana)

Jika `JITSI_APP_ID`/`JITSI_APP_SECRET` dikosongkan, ASN Pintar tetap berfungsi — tautan
dibuat tanpa token, room bersifat terbuka bagi siapa pun yang memiliki tautannya. Cocok
untuk uji coba internal, tidak disarankan untuk kelas resmi berskala instansi.

## 4. Kapasitas & performa

Jitsi videobridge cukup intensif CPU/bandwidth untuk kelas besar (>25 peserta serentak).
Untuk webinar satu-ke-banyak, pertimbangkan mengaktifkan modul **Jitsi Meet Live Streaming**
atau membatasi jumlah peserta dengan video aktif dan mendorong sisanya menonton via
streaming, sesuai kapasitas server yang tersedia.
