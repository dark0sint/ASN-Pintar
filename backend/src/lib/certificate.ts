import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const CERT_DIR = path.join(__dirname, "..", "..", "storage", "certificates");
if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

export function generateVerificationCode(userId: string, courseId: string): string {
  const raw = `${userId}:${courseId}:${Date.now()}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex").toUpperCase();
  return `ASN-${hash.slice(0, 12)}`;
}

interface CertData {
  namaLengkap: string;
  nip: string;
  jabatan: string;
  namaKelas: string;
  jp: number;
  tanggalTerbit: Date;
  kodeVerifikasi: string;
  verifyUrl: string;
}

/**
 * Membuat file PDF sertifikat dengan QR code verifikasi, mengembalikan path relatif file.
 * QR code mengarah ke `verifyUrl` (endpoint publik verifikasi sertifikat), sehingga
 * siapa pun dapat memindai dan memverifikasi keaslian sertifikat tanpa login.
 */
export async function generateCertificatePdf(data: CertData): Promise<string> {
  const fileName = `${data.kodeVerifikasi}.pdf`;
  const filePath = path.join(CERT_DIR, fileName);

  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { margin: 1, width: 200 });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#0E4038");
    doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56).stroke("#C98A2C");

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#535F58")
      .text("PEMERINTAH  \u00B7  BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA", 0, 70, {
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#1B2333")
      .text("Sertifikat Pelatihan Digital", 0, 100, { align: "center" });

    doc.font("Helvetica").fontSize(13).fillColor("#535F58").text("diberikan kepada", 0, 150, { align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#0E4038")
      .text(data.namaLengkap, 0, 175, { align: "center" });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#535F58")
      .text(`NIP ${data.nip}  \u00B7  ${data.jabatan}`, 0, 210, { align: "center" });

    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor("#535F58")
      .text("atas keberhasilan menyelesaikan program pelatihan", 0, 240, { align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#1B2333")
      .text(`${data.namaKelas} \u2014 ${data.jp} Jam Pelajaran`, 0, 262, { align: "center" });

    doc.image(qrBuffer, doc.page.width / 2 - 45, 300, { width: 90, height: 90 });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#535F58")
      .text(`Tanggal terbit: ${data.tanggalTerbit.toLocaleDateString("id-ID")}`, 0, 400, { align: "center" })
      .text(`Kode verifikasi: ${data.kodeVerifikasi}`, 0, 414, { align: "center" });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return `/storage/certificates/${fileName}`;
}
