import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../lib/prisma";
import { createLiveClassRoom, signJitsiUrl } from "../lib/jitsi";

export const liveClassRouter = Router();

liveClassRouter.get("/", requireAuth, async (_req, res) => {
  const classes = await prisma.liveClass.findMany({ include: { course: true }, orderBy: { tanggal: "asc" } });
  res.json(classes);
});

/**
 * Admin/widyaiswara menjadwalkan kelas tatap maya. Room Jitsi self-hosted dibuat
 * otomatis di sini — tautan yang dikembalikan mengarah ke JITSI_DOMAIN instansi
 * (lihat backend/src/lib/jitsi.ts), bukan ke server Jitsi publik.
 */
liveClassRouter.post("/", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
  const { judul, pengajar, tanggal, courseId } = req.body;
  const { room, url } = createLiveClassRoom(judul, req.user!.id);
  // Moderator (admin/widyaiswara) mendapat token moderator saat menjadwalkan.
  const modUrl = signJitsiUrl(room, req.user!.id, true).url;

  const liveClass = await prisma.liveClass.create({
    data: { judul, pengajar, tanggal: new Date(tanggal), courseId, jitsiRoom: room },
  });

  res.status(201).json({ ...liveClass, joinUrl: modUrl });
});

/** Peserta meminta tautan join saat akan masuk kelas (token dibuat fresh, bukan disimpan permanen). */
liveClassRouter.get("/:id/join", requireAuth, async (req: AuthedRequest, res) => {
  const lc = await prisma.liveClass.findUnique({ where: { id: req.params.id } });
  if (!lc) return res.status(404).json({ error: "Kelas daring tidak ditemukan." });
  const { url } = signJitsiUrl(lc.jitsiRoom, req.user!.id, false);
  res.json({ joinUrl: url });
});
