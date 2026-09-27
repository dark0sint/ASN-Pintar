import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { addPoints, maybeAwardBadge } from "./gamification.routes";

export const catRouter = Router();

catRouter.get("/exam", requireAuth, async (_req, res) => {
  const exam = await prisma.catExam.findFirst({ include: { soal: true } });
  if (!exam) return res.status(404).json({ error: "Belum ada bank soal CAT." });
  // sembunyikan jawaban benar dari payload yang dikirim ke klien
  const safe = { ...exam, soal: exam.soal.map(({ jawabanBenar, ...s }) => s) };
  res.json(safe);
});

catRouter.get("/history", requireAuth, async (req: AuthedRequest, res) => {
  const attempts = await prisma.catAttempt.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(attempts);
});

/** body: { examId, jawaban: { [questionId]: pickedIndex } } */
catRouter.post("/submit", requireAuth, async (req: AuthedRequest, res) => {
  const { examId, jawaban } = req.body as { examId: string; jawaban: Record<string, number> };
  const userId = req.user!.id;

  const exam = await prisma.catExam.findUnique({ where: { id: examId }, include: { soal: true } });
  if (!exam) return res.status(404).json({ error: "Ujian tidak ditemukan." });

  const perKategori: Record<string, { benar: number; total: number }> = {};
  let correct = 0;
  for (const q of exam.soal) {
    perKategori[q.kategori] = perKategori[q.kategori] || { benar: 0, total: 0 };
    perKategori[q.kategori].total++;
    if (jawaban[q.id] === q.jawabanBenar) {
      correct++;
      perKategori[q.kategori].benar++;
    }
  }
  const totalSkor = Math.round((correct / exam.soal.length) * 100);
  const lulus = totalSkor >= 70;

  const attempt = await prisma.catAttempt.create({
    data: { userId, examId, totalSkor, perKategori, lulus },
  });

  await addPoints(userId, lulus ? 50 : 20);
  if (lulus) await maybeAwardBadge(userId, "cat_lulus");

  res.json(attempt);
});
