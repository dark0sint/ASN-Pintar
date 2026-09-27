import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("Seed dilewati — data sudah ada.");
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const [dewi, bagus, ratna, admin] = await Promise.all([
    prisma.user.create({
      data: {
        email: "dewi@instansi.go.id", passwordHash, nama: "Dewi Anggraini", nip: "198705142010012004",
        jabatan: "Analis Kebijakan Muda", instansi: "BKPSDM Kota Madani", unit: "Bidang Pengembangan Kompetensi",
        role: "peserta",
      },
    }),
    prisma.user.create({
      data: {
        email: "bagus@instansi.go.id", passwordHash, nama: "Bagus Prasetyo", nip: "199002031201501001",
        jabatan: "Pengelola Data", instansi: "Dinas Kominfo", unit: "Bidang Layanan Data", role: "peserta",
      },
    }),
    prisma.user.create({
      data: {
        email: "ratna@instansi.go.id", passwordHash, nama: "Ratna Kusuma", nip: "198812092011022002",
        jabatan: "Kepala Sub Bagian Umum", instansi: "Sekretariat Daerah", unit: "Bagian Umum", role: "peserta",
      },
    }),
    prisma.user.create({
      data: {
        email: "admin@instansi.go.id", passwordHash, nama: "Sarah Widiastuti", jabatan: "Admin BKPSDM",
        instansi: "BKPSDM Kota Madani", unit: "Pusdiklat", role: "admin",
      },
    }),
  ]);

  const c1 = await prisma.course.create({
    data: {
      judul: "Pelayanan Publik Prima", kategori: "sosio", jp: 6,
      deskripsi: "Membangun standar layanan yang responsif, ramah, dan berorientasi pada kepuasan masyarakat.",
      competency: ["Pelayanan Publik"],
      modules: {
        create: [
          { judul: "Prinsip Dasar Pelayanan Publik", tipe: "video", menit: 5, urutan: 1 },
          { judul: "Studi Kasus: Keluhan Warga", tipe: "pdf", menit: 4, urutan: 2 },
          { judul: "Etika Berkomunikasi dengan Publik", tipe: "audio", menit: 5, urutan: 3 },
          { judul: "Standar Operasional Layanan", tipe: "ebook", menit: 3, urutan: 4 },
        ],
      },
      preTest: {
        create: [
          { soal: "Apa fokus utama pelayanan publik prima?", opsi: ["Kecepatan administrasi semata", "Kepuasan dan kebutuhan masyarakat", "Efisiensi anggaran", "Jumlah laporan bulanan"], jawabanBenar: 1 },
        ],
      },
      postTest: {
        create: [
          { soal: "Salah satu indikator pelayanan publik prima adalah...", opsi: ["Waktu tunggu tidak dipantau", "Transparansi dan kejelasan prosedur", "Layanan hanya via satu kanal", "Tidak ada mekanisme pengaduan"], jawabanBenar: 1 },
          { soal: "SOP layanan berguna untuk...", opsi: ["Menyulitkan pemohon", "Standarisasi & konsistensi mutu layanan", "Memperlambat proses", "Menambah birokrasi"], jawabanBenar: 1 },
        ],
      },
    },
  });

  const c2 = await prisma.course.create({
    data: {
      judul: "Integritas dan Anti Korupsi", kategori: "sosio", jp: 4,
      deskripsi: "Menanamkan nilai integritas ASN serta pengenalan pola-pola gratifikasi dan pencegahannya.",
      competency: ["Integritas"],
      modules: { create: [
        { judul: "Nilai Dasar Integritas ASN", tipe: "video", menit: 5, urutan: 1 },
        { judul: "Mengenali Gratifikasi", tipe: "ebook", menit: 4, urutan: 2 },
        { judul: "Pelaporan Whistleblowing System", tipe: "pdf", menit: 3, urutan: 3 },
      ]},
      preTest: { create: [
        { soal: "Gratifikasi yang wajib dilaporkan adalah yang berkaitan dengan...", opsi: ["Hadiah dari keluarga", "Jabatan dan berlawanan dengan kewajiban", "Pembelian pribadi", "Hadiah ulang tahun"], jawabanBenar: 1 },
      ]},
      postTest: { create: [
        { soal: "WBS (Whistleblowing System) berfungsi untuk...", opsi: ["Menutupi pelanggaran", "Melaporkan dugaan pelanggaran secara aman", "Menghukum pelapor", "Menggantikan APIP"], jawabanBenar: 1 },
        { soal: "Integritas ASN paling utama tercermin dari...", opsi: ["Konsistensi ucapan dan tindakan sesuai aturan", "Kepatuhan hanya saat diawasi", "Mengikuti tekanan atasan", "Menghindari tanggung jawab"], jawabanBenar: 0 },
      ]},
    },
  });

  const c3 = await prisma.course.create({
    data: {
      judul: "Kepemimpinan Transformasional", kategori: "manajerial", jp: 8,
      deskripsi: "Mengembangkan gaya kepemimpinan yang mendorong perubahan dan inovasi di lingkungan kerja.",
      competency: ["Manajerial", "Kepemimpinan"],
      modules: { create: [
        { judul: "Apa itu Kepemimpinan Transformasional", tipe: "video", menit: 5, urutan: 1 },
        { judul: "Memimpin Perubahan di Unit Kerja", tipe: "pdf", menit: 5, urutan: 2 },
        { judul: "Coaching untuk Tim", tipe: "audio", menit: 4, urutan: 3 },
        { judul: "Studi Kasus Transformasi Layanan", tipe: "ebook", menit: 5, urutan: 4 },
      ]},
      preTest: { create: [
        { soal: "Ciri utama pemimpin transformasional adalah...", opsi: ["Mempertahankan status quo", "Menginspirasi & memberdayakan tim", "Mengontrol secara ketat tanpa delegasi", "Menghindari risiko perubahan"], jawabanBenar: 1 },
      ]},
      postTest: { create: [
        { soal: "Coaching efektif berfokus pada...", opsi: ["Memberi jawaban langsung", "Menggali potensi & solusi dari coachee", "Menilai kesalahan masa lalu", "Mengabaikan target kinerja"], jawabanBenar: 1 },
        { soal: "Memimpin perubahan membutuhkan...", opsi: ["Komunikasi visi yang jelas", "Instruksi tanpa penjelasan", "Mengabaikan resistensi", "Bekerja sendiri"], jawabanBenar: 0 },
      ]},
    },
  });

  const c4 = await prisma.course.create({
    data: {
      judul: "Digitalisasi Layanan Pemerintahan", kategori: "teknis", jp: 6,
      deskripsi: "Memahami transformasi digital layanan publik, keamanan data, dan pemanfaatan sistem informasi.",
      competency: ["Transformasi Digital"],
      modules: { create: [
        { judul: "Tren Transformasi Digital Pemerintahan", tipe: "video", menit: 4, urutan: 1 },
        { judul: "Keamanan Data & Privasi", tipe: "pdf", menit: 5, urutan: 2 },
        { judul: "Integrasi Sistem Layanan", tipe: "ebook", menit: 4, urutan: 3 },
      ]},
      preTest: { create: [
        { soal: "Tujuan utama digitalisasi layanan publik adalah...", opsi: ["Menggantikan seluruh SDM", "Efisiensi, transparansi, aksesibilitas layanan", "Menambah biaya operasional", "Mempersulit akses warga"], jawabanBenar: 1 },
      ]},
      postTest: { create: [
        { soal: "Data pribadi warga dalam sistem digital pemerintah harus...", opsi: ["Dibagikan bebas ke pihak ketiga", "Dilindungi sesuai regulasi privasi data", "Disimpan tanpa enkripsi", "Dipublikasikan untuk transparansi"], jawabanBenar: 1 },
        { soal: "Integrasi sistem antar-instansi bermanfaat untuk...", opsi: ["Duplikasi data", "Mengurangi duplikasi & mempercepat layanan", "Memperlambat proses", "Menambah dokumen fisik"], jawabanBenar: 1 },
      ]},
    },
  });

  await prisma.course.create({
    data: {
      judul: "Pengelolaan Keuangan Negara Dasar", kategori: "teknis", jp: 6,
      deskripsi: "Prinsip dasar penganggaran, pelaksanaan, dan pertanggungjawaban keuangan instansi pemerintah.",
      competency: ["Keuangan Negara"],
      modules: { create: [
        { judul: "Siklus Anggaran Pemerintah", tipe: "pdf", menit: 5, urutan: 1 },
        { judul: "Prinsip Akuntabilitas Anggaran", tipe: "ebook", menit: 4, urutan: 2 },
        { judul: "Dasar Pelaporan Keuangan", tipe: "pdf", menit: 5, urutan: 3 },
      ]},
      preTest: { create: [
        { soal: "Siklus anggaran pemerintah diawali dengan tahap...", opsi: ["Pertanggungjawaban", "Perencanaan & penganggaran", "Audit eksternal", "Pelaporan akhir tahun"], jawabanBenar: 1 },
      ]},
      postTest: { create: [
        { soal: "Prinsip akuntabilitas anggaran menekankan...", opsi: ["Penggunaan anggaran tanpa laporan", "Pertanggungjawaban penggunaan dana publik", "Kebebasan tanpa batas", "Penundaan pelaporan"], jawabanBenar: 1 },
        { soal: "Laporan keuangan instansi pemerintah wajib bersifat...", opsi: ["Rahasia total", "Transparan dan dapat diaudit", "Hanya untuk pimpinan", "Tidak berkala"], jawabanBenar: 1 },
      ]},
    },
  });

  await prisma.catExam.create({
    data: {
      judul: "Simulasi CAT Kompetensi ASN", durasiMenit: 20,
      soal: { create: [
        { kategori: "teknis", soal: "Sistem yang digunakan BKN untuk layanan kepegawaian ASN dikenal dengan nama...", opsi: ["SIASN", "SIMPEG lokal", "E-Kinerja saja", "LAPOR"], jawabanBenar: 0 },
        { kategori: "teknis", soal: "Dokumen yang menjadi dasar penilaian kinerja ASN adalah...", opsi: ["SKP (Sasaran Kinerja Pegawai)", "KTP", "Surat cuti", "Nota dinas"], jawabanBenar: 0 },
        { kategori: "manajerial", soal: "Delegasi tugas yang efektif membutuhkan...", opsi: ["Kepercayaan & kejelasan target", "Kontrol penuh tanpa kepercayaan", "Menghindari tanggung jawab", "Instruksi tanpa evaluasi"], jawabanBenar: 0 },
        { kategori: "manajerial", soal: "Pengambilan keputusan manajerial yang baik mempertimbangkan...", opsi: ["Data & dampak bagi banyak pihak", "Keinginan pribadi", "Opini tanpa dasar", "Kecepatan semata tanpa analisis"], jawabanBenar: 0 },
        { kategori: "sosio", soal: "Sikap ASN terhadap keberagaman masyarakat yang dilayani sebaiknya...", opsi: ["Menghargai & adaptif terhadap perbedaan", "Menyamaratakan tanpa memahami konteks", "Mengabaikan perbedaan budaya", "Membeda-bedakan layanan"], jawabanBenar: 0 },
        { kategori: "sosio", soal: "Kerja sama lintas budaya di lingkungan kerja memerlukan...", opsi: ["Empati & komunikasi terbuka", "Dominasi satu kelompok", "Menghindari interaksi", "Asumsi tanpa klarifikasi"], jawabanBenar: 0 },
      ]},
    },
  });

  await prisma.task.create({
    data: { courseId: c1.id, judul: "Analisis Studi Kasus Pengaduan Layanan", instruksi: "Unggah/tulis analisis singkat atas satu kasus pengaduan layanan di unit Anda dan solusi yang diusulkan." },
  });
  await prisma.task.create({
    data: { courseId: c3.id, judul: "Rencana Aksi Perubahan Unit Kerja", instruksi: "Tuliskan satu rencana aksi perubahan sederhana yang dapat diterapkan di unit kerja Anda dalam 3 bulan." },
  });

  const thread = await prisma.forumThread.create({
    data: {
      courseId: c1.id, judul: "Diskusi: Menangani keluhan warga yang emosional",
      posts: { create: [{ userId: dewi.id, isi: "Ada yang punya tips menenangkan pemohon yang datang dalam keadaan marah?" }] },
    },
  });
  await prisma.forumPost.create({ data: { threadId: thread.id, userId: bagus.id, isi: "Biasanya saya dengarkan dulu sampai selesai, baru sampaikan solusi bertahap." } });

  const mentor1 = await prisma.mentor.create({
    data: {
      nama: "Ir. Hendra Wijaya, M.M.", keahlian: "Kepemimpinan & Manajemen Kinerja",
      slots: { create: [
        { tanggal: new Date("2026-10-02T10:00:00Z") },
        { tanggal: new Date("2026-10-03T14:00:00Z") },
        { tanggal: new Date("2026-10-06T09:00:00Z") },
      ]},
    },
  });
  await prisma.mentor.create({
    data: {
      nama: "Dra. Yuliana Putri", keahlian: "Pelayanan Publik & Pengaduan Masyarakat",
      slots: { create: [
        { tanggal: new Date("2026-10-02T13:00:00Z") },
        { tanggal: new Date("2026-10-05T11:00:00Z") },
      ]},
    },
  });

  await prisma.liveClass.create({
    data: { courseId: c2.id, judul: "Webinar: Etika Digital ASN", pengajar: "Widyaiswara Ahmad Fauzi", tanggal: new Date("2026-10-05T09:00:00Z"), jitsiRoom: "asnpintar-etika-digital-asn-demo" },
  });
  await prisma.liveClass.create({
    data: { courseId: c3.id, judul: "Kelas Tatap Maya: Coaching untuk Pemimpin", pengajar: "Widyaiswara Nina Kartika", tanggal: new Date("2026-10-12T13:00:00Z"), jitsiRoom: "asnpintar-coaching-pemimpin-demo" },
  });
  await prisma.liveClass.create({
    data: { courseId: c4.id, judul: "Sesi Tanya-Jawab: Keamanan Data Pemerintah", pengajar: "Widyaiswara Rio Saputra", tanggal: new Date("2026-10-19T10:00:00Z"), jitsiRoom: "asnpintar-keamanan-data-demo" },
  });

  const badgeDefs = [
    { id: "first_course", nama: "Langkah Pertama", desc: "Menyelesaikan 1 kelas", glyph: "🎯" },
    { id: "three_course", nama: "Pembelajar Konsisten", desc: "Menyelesaikan 3 kelas", glyph: "📚" },
    { id: "cat_lulus", nama: "Siap Uji Kompetensi", desc: "Lulus simulasi CAT", glyph: "🏅" },
    { id: "jp_target", nama: "Target JP Tercapai", desc: "Mencapai target JP tahunan", glyph: "⭐" },
    { id: "forum_aktif", nama: "Kontributor Forum", desc: "Aktif berdiskusi di forum", glyph: "💬" },
  ];
  for (const b of badgeDefs) await prisma.badge.create({ data: b });

  console.log("Seed selesai. Akun contoh: dewi@instansi.go.id / bagus@instansi.go.id / ratna@instansi.go.id / admin@instansi.go.id — kata sandi: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
