import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { addPoints, maybeAwardBadge } from "./gamification.routes";

export const forumRouter = Router();

forumRouter.get("/course/:courseId", requireAuth, async (req, res) => {
  const threads = await prisma.forumThread.findMany({
    where: { courseId: req.params.courseId },
    include: { posts: { include: { user: { select: { nama: true } } }, orderBy: { createdAt: "asc" } } },
  });
  res.json(threads);
});

forumRouter.post("/course/:courseId/thread", requireAuth, async (req: AuthedRequest, res) => {
  const { judul, isi } = req.body;
  const thread = await prisma.forumThread.create({
    data: {
      courseId: req.params.courseId,
      judul,
      posts: { create: { userId: req.user!.id, isi } },
    },
    include: { posts: true },
  });
  await addPoints(req.user!.id, 3);
  await maybeAwardBadge(req.user!.id, "forum_aktif");
  res.status(201).json(thread);
});

forumRouter.post("/thread/:threadId/reply", requireAuth, async (req: AuthedRequest, res) => {
  const post = await prisma.forumPost.create({
    data: { threadId: req.params.threadId, userId: req.user!.id, isi: req.body.isi },
  });
  await addPoints(req.user!.id, 3);
  await maybeAwardBadge(req.user!.id, "forum_aktif");
  res.status(201).json(post);
});
