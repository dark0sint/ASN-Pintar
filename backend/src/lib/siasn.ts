/**
 * STUB — Integrasi SIASN/SAPK BKN
 * ---------------------------------
 * Kami TIDAK dapat mengimplementasikan integrasi nyata ke SIASN/SAPK di sini karena:
 *   1. Memerlukan kredensial API resmi (client ID/secret) yang hanya diterbitkan BKN
 *      melalui pengajuan kerja sama formal oleh instansi Anda.
 *   2. Spesifikasi endpoint, format payload, dan mekanisme autentikasi SIASN bersifat
 *      internal/terbatas dan dapat berubah — mengarang bentuknya berisiko salah dan
 *      berbahaya jika dipakai untuk data kepegawaian sungguhan.
 *
 * Titik ekstensi yang disiapkan:
 *  - `pushCertificateToSiasn()`  → panggil setelah sertifikat diterbitkan (lihat
 *    routes/certificates.routes.ts) untuk mengirim data pelatihan ke riwayat
 *    kepegawaian ASN di SIASN, begitu kredensial & spesifikasi resmi tersedia.
 *  - `pullEmployeeProfile()`     → untuk menarik data profil ASN (NIP, jabatan,
 *    instansi) otomatis saat pengguna pertama kali login, alih-alih diinput manual.
 *
 * Sampai kredensial resmi tersedia, kedua fungsi ini hanya mencatat log dan
 * tidak melakukan panggilan jaringan apa pun.
 */
import { config } from "../config";

export async function pushCertificateToSiasn(payload: {
  nip: string;
  namaKelas: string;
  jp: number;
  tanggalTerbit: Date;
  kodeVerifikasi: string;
}) {
  if (!config.siasn.baseUrl) {
    console.warn(
      "[SIASN] Belum dikonfigurasi (SIASN_API_BASE_URL kosong). Sertifikat TIDAK dikirim ke SIASN:",
      payload.kodeVerifikasi
    );
    return { sent: false, reason: "not_configured" };
  }
  // TODO: implementasikan pemanggilan API resmi sesuai dokumentasi teknis BKN
  // setelah kredensial diperoleh. Contoh kerangka:
  //
  // const res = await fetch(`${config.siasn.baseUrl}/riwayat-pelatihan`, {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${await getSiasnAccessToken()}` },
  //   body: JSON.stringify(payload),
  // });
  throw new Error("Integrasi SIASN belum diimplementasikan — lihat komentar di lib/siasn.ts");
}

export async function pullEmployeeProfile(nip: string) {
  if (!config.siasn.baseUrl) {
    console.warn("[SIASN] Belum dikonfigurasi. Profil pegawai harus diinput manual untuk NIP:", nip);
    return null;
  }
  throw new Error("Integrasi SIASN belum diimplementasikan — lihat komentar di lib/siasn.ts");
}
