import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { generateCertificatePdf, generateVerificationCode } from "../lib/certificate";
import { pushCertificateToSiasn } from "../lib/siasn";

export const certificatesRouter = Router();

certificatesRouter.get("/mine", requireAuth, async (req: AuthedRequest, res) => {
  const certs = await prisma.certificate.findMany({ where: { userId: req.user!.id } });
  res.json(certs);
});

certificatesRouter.post("/issue/:courseId", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const courseId = req.params.courseId;

  const [user, course, enrollment] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
  ]);
  if (!user || !course) return res.status(404).json({ error: "Data tidak ditemukan." });
  if (!enrollment || enrollment.status !== "selesai") {
    return res.status(400).json({ error: "Kelas belum diselesaikan (post-test belum lulus)." });
  }

  const existing = await prisma.certificate.findFirst({ where: { userId, courseId } });
  if (existing) return res.json(existing);

  const kodeVerifikasi = generateVerificationCode(userId, courseId);
  const verifyUrl = `${req.protocol}://${req.get("host")}/api/certificates/verify/${kodeVerifikasi}`;

  const pdfPath = await generateCertificatePdf({
    namaLengkap: user.nama,
    nip: user.nip || "-",
    jabatan: user.jabatan || "-",
    namaKelas: course.judul,
    jp: course.jp,
    tanggalTerbit: new Date(),
    kodeVerifikasi,
    verifyUrl,
  });

  const cert = await prisma.certificate.create({
    data: { userId, courseId, kodeVerifikasi, pdfPath },
  });
  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { certIssued: true } });

  // Best-effort push ke SIASN — tidak menggagalkan penerbitan sertifikat jika belum dikonfigurasi.
  pushCertificateToSiasn({
    nip: user.nip || "",
    namaKelas: course.judul,
    jp: course.jp,
    tanggalTerbit: new Date(),
    kodeVerifikasi,
  }).catch((e) => console.warn("[SIASN push] dilewati:", e.message));

  res.status(201).json(cert);
});

/** Endpoint publik (tanpa login) untuk verifikasi keaslian sertifikat via scan QR. */
certificatesRouter.get("/verify/:kode", async (req, res) => {
  const cert = await prisma.certificate.findUnique({
    where: { kodeVerifikasi: req.params.kode },
    include: { user: true },
  });
  if (!cert) return res.status(404).json({ valid: false, error: "Kode verifikasi tidak ditemukan." });
  const course = await prisma.course.findUnique({ where: { id: cert.courseId } });
  res.json({
    valid: true,
    nama: cert.user.nama,
    namaKelas: course?.judul,
    tanggalTerbit: cert.issuedAt,
  });
});
