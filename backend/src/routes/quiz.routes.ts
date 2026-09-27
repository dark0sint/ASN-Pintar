import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { addPoints, maybeAwardBadge } from "./gamification.routes";

export const quizRouter = Router();

/**
 * body: { courseId, jenis: 'pre' | 'post', jawaban: number[] }  // jawaban[i] = indeks opsi yang dipilih, atau -1
 */
quizRouter.post("/submit", requireAuth, async (req: AuthedRequest, res) => {
  const { courseId, jenis, jawaban } = req.body as { courseId: string; jenis: "pre" | "post"; jawaban: number[] };
  const userId = req.user!.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { preTest: true, postTest: true, modules: true },
  });
  if (!course) return res.status(404).json({ error: "Kelas tidak ditemukan." });

  const bank = jenis === "pre" ? course.preTest : course.postTest;
  if (jenis === "post") {
    const completions = await prisma.moduleCompletion.count({ where: { userId, module: { courseId } } });
    if (completions < course.modules.length) {
      return res.status(400).json({ error: "Selesaikan seluruh materi sebelum mengerjakan Post-Test." });
    }
  }

  let correct = 0;
  bank.forEach((q, i) => {
    if (jawaban[i] === q.jawabanBenar) correct++;
  });
  const skor = Math.round((correct / bank.length) * 100);

  await prisma.quizAttempt.create({ data: { userId, courseId, jenis, skor } });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: jenis === "pre" ? { preScore: skor } : { postScore: skor },
    create: { userId, courseId, ...(jenis === "pre" ? { preScore: skor } : { postScore: skor }) },
  });

  if (jenis === "post" && skor >= 60) {
    if (enrollment.status !== "selesai") {
      await prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: "selesai" } });
      await addPoints(userId, 30);
      const selesaiCount = await prisma.enrollment.count({ where: { userId, status: "selesai" } });
      if (selesaiCount >= 1) await maybeAwardBadge(userId, "first_course");
      if (selesaiCount >= 3) await maybeAwardBadge(userId, "three_course");
    }
  }

  res.json({ skor, lulus: jenis === "post" ? skor >= 60 : undefined });
});
