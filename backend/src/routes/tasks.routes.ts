import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../lib/prisma";
import { addPoints } from "./gamification.routes";

export const tasksRouter = Router();

tasksRouter.get("/course/:courseId", requireAuth, async (req: AuthedRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { courseId: req.params.courseId },
    include: { submissions: { where: { userId: req.user!.id } } },
  });
  res.json(tasks);
});

tasksRouter.post("/:taskId/submit", requireAuth, async (req: AuthedRequest, res) => {
  const sub = await prisma.taskSubmission.create({
    data: { taskId: req.params.taskId, userId: req.user!.id, teks: req.body.teks },
  });
  await addPoints(req.user!.id, 10);
  res.status(201).json(sub);
});

/** Admin/mentor: daftar seluruh tugas yang menunggu dinilai */
tasksRouter.get("/pending-review", requireAuth, requireRole("admin"), async (_req, res) => {
  const subs = await prisma.taskSubmission.findMany({
    where: { status: "menunggu" },
    include: { task: true, user: { select: { nama: true } } },
  });
  res.json(subs);
});

tasksRouter.post("/submission/:id/grade", requireAuth, requireRole("admin"), async (req, res) => {
  const { nilai, feedback } = req.body;
  const sub = await prisma.taskSubmission.update({
    where: { id: req.params.id },
    data: { nilai, feedback, status: "dinilai" },
  });
  res.json(sub);
});
