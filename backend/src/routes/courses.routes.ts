import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../lib/prisma";

export const coursesRouter = Router();

coursesRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const courses = await prisma.course.findMany({
    include: { modules: { orderBy: { urutan: "asc" } } },
  });
  res.json(courses);
});

coursesRouter.get("/:id", requireAuth, async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { modules: { orderBy: { urutan: "asc" } }, preTest: true, postTest: true },
  });
  if (!course) return res.status(404).json({ error: "Kelas tidak ditemukan." });
  res.json(course);
});

coursesRouter.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { judul, kategori, deskripsi, jp, competency } = req.body;
  const course = await prisma.course.create({
    data: { judul, kategori, deskripsi, jp, competency: competency || [] },
  });
  res.status(201).json(course);
});

coursesRouter.post("/:id/modules", requireAuth, requireRole("admin"), async (req, res) => {
  const { judul, tipe, menit, urutan } = req.body;
  const mod = await prisma.module.create({
    data: { courseId: req.params.id, judul, tipe, menit, urutan: urutan || 0 },
  });
  res.status(201).json(mod);
});

/**
 * Rekomendasi berbasis aturan sederhana (jabatan -> daftar kompetensi wajib) yang
 * dibandingkan dengan kelas yang sudah diselesaikan pengguna. Ini adalah versi
 * "AI ringan" yang transparan dan mudah diaudit; dapat digantikan model ML/embedding
 * di kemudian hari tanpa mengubah kontrak endpoint ini (tetap mengembalikan daftar
 * courseId + alasan).
 */
const JABATAN_COMPETENCY_MAP: Record<string, string[]> = {
  "Analis Kebijakan Muda": ["Pelayanan Publik", "Transformasi Digital"],
  "Pengelola Data": ["Transformasi Digital", "Keuangan Negara"],
  "Kepala Sub Bagian Umum": ["Manajerial", "Kepemimpinan", "Integritas"],
};
const DEFAULT_COMPETENCY = ["Pelayanan Publik", "Integritas"];

coursesRouter.get("/recommendations/for-me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { enrollments: { where: { status: "selesai" }, include: { course: true } } },
  });
  if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });

  const completedCompetencies = new Set(user.enrollments.flatMap((e) => e.course.competency));
  const needed = JABATAN_COMPETENCY_MAP[user.jabatan || ""] || DEFAULT_COMPETENCY;
  const gap = needed.filter((n) => !completedCompetencies.has(n));

  const courses = await prisma.course.findMany();
  const recommended = courses.filter((c) => c.competency.some((t) => gap.includes(t)));

  res.json({
    gap,
    recommendations: (recommended.length ? recommended : courses.slice(0, 2)).map((c) => ({
      courseId: c.id,
      judul: c.judul,
      alasan: `Memperkuat kompetensi ${c.competency.filter((t) => gap.includes(t)).join(", ") || c.competency.join(", ")} untuk jabatan ${user.jabatan}`,
    })),
  });
});
