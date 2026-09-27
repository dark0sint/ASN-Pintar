import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export const mentoringRouter = Router();

mentoringRouter.get("/mentors", requireAuth, async (_req, res) => {
  const mentors = await prisma.mentor.findMany({ include: { slots: true } });
  res.json(mentors);
});

mentoringRouter.post("/slots/:slotId/book", requireAuth, async (req: AuthedRequest, res) => {
  const slot = await prisma.mentoringSlot.findUnique({ where: { id: req.params.slotId } });
  if (!slot) return res.status(404).json({ error: "Slot tidak ditemukan." });
  if (slot.bookedById) return res.status(409).json({ error: "Slot sudah dipesan peserta lain." });

  const updated = await prisma.mentoringSlot.update({
    where: { id: req.params.slotId },
    data: { bookedById: req.user!.id },
  });
  res.json(updated);
});

mentoringRouter.get("/my-sessions", requireAuth, async (req: AuthedRequest, res) => {
  const slots = await prisma.mentoringSlot.findMany({
    where: { bookedById: req.user!.id },
    include: { mentor: true },
  });
  res.json(slots);
});
