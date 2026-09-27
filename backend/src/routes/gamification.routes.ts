import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export const gamificationRouter = Router();

export const BADGE_DEFS = [
  { id: "first_course", nama: "Langkah Pertama", desc: "Menyelesaikan 1 kelas", glyph: "🎯" },
  { id: "three_course", nama: "Pembelajar Konsisten", desc: "Menyelesaikan 3 kelas", glyph: "📚" },
  { id: "cat_lulus", nama: "Siap Uji Kompetensi", desc: "Lulus simulasi CAT", glyph: "🏅" },
  { id: "jp_target", nama: "Target JP Tercapai", desc: "Mencapai target JP tahunan", glyph: "⭐" },
  { id: "forum_aktif", nama: "Kontributor Forum", desc: "Aktif berdiskusi di forum", glyph: "💬" },
];

/** Pastikan seluruh definisi lencana ada di tabel Badge (dipanggil dari seed juga). */
export async function ensureBadgeDefs() {
  for (const b of BADGE_DEFS) {
    await prisma.badge.upsert({ where: { id: b.id }, update: {}, create: b });
  }
}

export async function maybeAwardBadge(userId: string, badgeId: string) {
  await ensureBadgeDefs();
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    update: {},
    create: { userId, badgeId },
  });
}

export async function addPoints(userId: string, amount: number) {
  await prisma.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
}

gamificationRouter.get("/badges", requireAuth, async (_req, res) => {
  const badges = await prisma.badge.findMany();
  res.json(badges.length ? badges : BADGE_DEFS);
});

gamificationRouter.get("/leaderboard", requireAuth, async (_req: AuthedRequest, res) => {
  const users = await prisma.user.findMany({
    where: { role: "peserta" },
    orderBy: { points: "desc" },
    select: { id: true, nama: true, instansi: true, points: true, _count: { select: { badges: true } } },
  });
  res.json(users);
});
