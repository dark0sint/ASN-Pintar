import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { menitToJp } from "../lib/jp";
import { maybeAwardBadge } from "./gamification.routes";

export const progressRouter = Router();

async function ensureEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });
}

progressRouter.get("/course/:courseId", requireAuth, async (req: AuthedRequest, res) => {
  const enrollment = await ensureEnrollment(req.user!.id, req.params.courseId);
  const completions = await prisma.moduleCompletion.findMany({
    where: { userId: req.user!.id, module: { courseId: req.params.courseId } },
  });
  res.json({ enrollment, completedModuleIds: completions.map((c) => c.moduleId) });
});

progressRouter.post("/module/:moduleId/toggle", requireAuth, async (req: AuthedRequest, res) => {
  const mod = await prisma.module.findUnique({ where: { id: req.params.moduleId } });
  if (!mod) return res.status(404).json({ error: "Modul tidak ditemukan." });
  const userId = req.user!.id;

  const existing = await prisma.moduleCompletion.findUnique({
    where: { moduleId_userId: { moduleId: mod.id, userId } },
  });

  const jpDelta = menitToJp(mod.menit);
  if (existing) {
    await prisma.moduleCompletion.delete({ where: { id: existing.id } });
    await prisma.user.update({ where: { id: userId }, data: { jpTahunIni: { decrement: jpDelta } } });
  } else {
    await prisma.moduleCompletion.create({ data: { moduleId: mod.id, userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { jpTahunIni: { increment: jpDelta }, points: { increment: 5 } },
    });
    await ensureEnrollment(userId, mod.courseId);
    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId: mod.courseId } },
      data: { status: "berjalan" },
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.jpTahunIni >= user.jpTarget) await maybeAwardBadge(userId, "jp_target");
  }

  const completions = await prisma.moduleCompletion.findMany({
    where: { userId, module: { courseId: mod.courseId } },
  });
  res.json({ completedModuleIds: completions.map((c) => c.moduleId) });
});
