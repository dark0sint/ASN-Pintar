import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../lib/prisma";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/overview", async (_req, res) => {
  const [totalPeserta, peserta, courses] = await Promise.all([
    prisma.user.count({ where: { role: "peserta" } }),
    prisma.user.findMany({ where: { role: "peserta" } }),
    prisma.course.findMany(),
  ]);

  const patuh = peserta.filter((u) => u.jpTahunIni >= u.jpTarget).length;
  const totalJp = peserta.reduce((a, u) => a + u.jpTahunIni, 0);

  const completions = await Promise.all(
    courses.map(async (c) => ({
      courseId: c.id,
      judul: c.judul,
      selesai: await prisma.enrollment.count({ where: { courseId: c.id, status: "selesai" } }),
    }))
  );

  res.json({
    totalPeserta,
    patuh,
    totalJp: +totalJp.toFixed(1),
    totalKelas: courses.length,
    completions,
  });
});

adminRouter.get("/pegawai", async (_req, res) => {
  const peserta = await prisma.user.findMany({
    where: { role: "peserta" },
    include: { enrollments: true },
  });
  res.json(
    peserta.map((u) => ({
      id: u.id,
      nama: u.nama,
      nip: u.nip,
      jabatan: u.jabatan,
      instansi: u.instansi,
      kelasSelesai: u.enrollments.filter((e) => e.status === "selesai").length,
      jpTahunIni: u.jpTahunIni,
      jpTarget: u.jpTarget,
      points: u.points,
    }))
  );
});

/** Ekspor CSV siap-Excel untuk kebutuhan audit administrasi. */
adminRouter.get("/laporan/csv", async (_req, res) => {
  const peserta = await prisma.user.findMany({ where: { role: "peserta" }, include: { enrollments: true } });
  const header = ["Nama", "NIP", "Jabatan", "Instansi", "Kelas Selesai", "JP Tahun Ini", "Target JP", "Poin"];
  const rows = peserta.map((u) => [
    u.nama,
    u.nip || "",
    u.jabatan || "",
    u.instansi || "",
    String(u.enrollments.filter((e) => e.status === "selesai").length),
    String(u.jpTahunIni),
    String(u.jpTarget),
    String(u.points),
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=laporan-asn-pintar.csv");
  res.send(csv);
});
