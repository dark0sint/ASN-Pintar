import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { badges: { include: { badge: true } } },
  });
  if (!user) return res.status(404).json({ error: "Pengguna tidak ditemukan." });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

usersRouter.get("/leaderboard", requireAuth, async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: "peserta" },
    orderBy: { points: "desc" },
    select: { id: true, nama: true, instansi: true, points: true, badges: true },
  });
  res.json(users);
});
