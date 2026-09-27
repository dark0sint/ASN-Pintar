import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [recs, setRecs] = useState<any>({ gap: [], recommendations: [] });
  const [badges, setBadges] = useState<any[]>([]);
  const [catHistory, setCatHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get("/courses").then((r) => setCourses(r.data));
    api.get("/courses/recommendations/for-me").then((r) => setRecs(r.data));
    api.get("/gamification/badges").then((r) => setBadges(r.data));
    api.get("/cat/history").then((r) => setCatHistory(r.data)).catch(() => {});
  }, []);

  if (!user) return null;
  const lastCat = catHistory[0];

  return (
    <div>
      <div className="flex bg-surface border border-line rounded-sm mb-6 overflow-x-auto">
        {[
          [`${user.jpTahunIni} / ${user.jpTarget} JP`, "Jam pelajaran tahun ini"],
          [String(user.points), "Poin gamifikasi"],
          [String(courses.length), "Kelas tersedia"],
        ].map(([num, lbl], i) => (
          <div key={i} className="flex-1 min-w-[150px] px-5 py-4 border-r border-line last:border-r-0">
            <div className="font-display text-2xl font-semibold">{num}</div>
            <div className="text-[11.5px] text-inksoft mt-1.5">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div className="space-y-4">
          <div className="panel">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">Rekomendasi untuk Anda</h2>
              <span className="text-xs text-inksoft">berbasis jabatan &amp; celah kompetensi</span>
            </div>
            <p className="text-[12.5px] text-inksoft -mt-1 mb-3">
              Sebagai <strong>{user.jabatan}</strong>, kompetensi yang disarankan diperkuat:{" "}
              {recs.gap?.length ? recs.gap.map((g: string) => <span key={g} className="tag tag-teal mr-1">{g}</span>) : <span className="tag tag-teal">Terpenuhi</span>}
            </p>
            {(recs.recommendations || []).slice(0, 3).map((r: any) => (
              <Link to={`/kelas/${r.courseId}`} key={r.courseId} className="block border border-line border-l-4 border-l-primary rounded-sm p-3.5 mb-2 hover:bg-surface2">
                <div className="font-semibold text-sm">{r.judul}</div>
                <div className="text-[11.5px] text-inksoft mt-1">{r.alasan}</div>
              </Link>
            ))}
          </div>

          <div className="panel">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">Katalog kelas</h2>
              <Link to="/kelas" className="text-xs text-inksoft">Lihat semua →</Link>
            </div>
            {courses.slice(0, 3).map((c) => (
              <Link to={`/kelas/${c.id}`} key={c.id} className="flex gap-3 border border-line border-l-4 border-l-primary rounded-sm p-3.5 mb-2 hover:bg-surface2">
                <div className="font-mono text-[11px] text-inksoft w-12">{c.jp} JP</div>
                <div>
                  <div className="font-semibold text-sm">{c.judul}</div>
                  <div className="text-[11.5px] text-inksoft mt-1">{c.modules.length} modul · {c.kategori}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel">
            <h2 className="text-lg font-semibold mb-3">Lencana saya</h2>
            <div className="flex flex-wrap gap-2.5">
              {badges.map((b) => (
                <div key={b.id} className="w-14 text-center text-[10px] text-inksoft">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto bg-accentsoft border border-accent">
                    {b.glyph}
                  </div>
                  {b.nama}
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2 className="text-lg font-semibold mb-3">Simulasi CAT terakhir</h2>
            {lastCat ? (
              <p className="text-sm">Skor total: <strong>{lastCat.totalSkor}%</strong> — {lastCat.lulus ? "Lulus" : "Belum lulus"}</p>
            ) : (
              <p className="text-sm text-inksoft">Anda belum pernah mengikuti simulasi CAT.</p>
            )}
            <Link to="/cat" className="btn btn-secondary mt-2">Mulai simulasi CAT →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
