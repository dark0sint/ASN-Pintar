import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);

  async function load() {
    const [o, p] = await Promise.all([api.get("/admin/overview"), api.get("/tasks/pending-review")]);
    setOverview(o.data);
    setPending(p.data);
  }
  useEffect(() => { load(); }, []);

  async function grade(id: string, nilai: number, feedback: string) {
    await api.post(`/tasks/submission/${id}/grade`, { nilai, feedback });
    load();
  }

  if (!overview) return <p className="text-inksoft">Memuat...</p>;
  const max = Math.max(1, ...overview.completions.map((c: any) => c.selesai));

  return (
    <div>
      <div className="flex bg-surface border border-line rounded-sm mb-6 overflow-x-auto">
        {[
          [overview.totalPeserta, "Total ASN terdaftar"],
          [`${overview.patuh}/${overview.totalPeserta}`, "Patuh target JP tahunan"],
          [overview.totalJp, "Total JP terkumpul"],
          [overview.totalKelas, "Kelas tersedia"],
        ].map(([num, lbl]: any, i) => (
          <div key={i} className="flex-1 min-w-[150px] px-5 py-4 border-r border-line last:border-r-0">
            <div className="font-display text-2xl font-semibold">{num}</div>
            <div className="text-[11.5px] text-inksoft mt-1.5">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="panel mb-4">
        <h2 className="text-lg font-semibold mb-3">Penyelesaian per kelas</h2>
        <div className="flex items-end gap-3 h-36">
          {overview.completions.map((c: any) => (
            <div key={c.courseId} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full max-w-[34px] bg-primary rounded-t-sm" style={{ height: `${(c.selesai / max) * 100}%` }} />
              <div className="text-[10.5px] text-inksoft text-center">{c.judul.split(" ").slice(0, 2).join(" ")}<br />{c.selesai}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2 className="text-lg font-semibold mb-3">Tugas menunggu penilaian</h2>
        {pending.length ? pending.map((s: any) => (
          <GradeRow key={s.id} sub={s} onGrade={grade} />
        )) : <p className="text-inksoft text-sm text-center py-6">Tidak ada tugas yang menunggu penilaian.</p>}
      </div>
    </div>
  );
}

function GradeRow({ sub, onGrade }: { sub: any; onGrade: (id: string, nilai: number, feedback: string) => void }) {
  const [nilai, setNilai] = useState("");
  const [feedback, setFeedback] = useState("");
  return (
    <div className="panel bg-surface2 mb-3">
      <h3 className="font-semibold text-[14.5px] mb-2">{sub.task.judul} — {sub.user.nama}</h3>
      <p className="text-[13px] mb-2.5">{sub.teks}</p>
      <div className="flex gap-2 items-center">
        <input type="number" min={0} max={100} placeholder="Nilai (0-100)" className="max-w-[140px]" value={nilai} onChange={(e) => setNilai(e.target.value)} />
        <input placeholder="Catatan (opsional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <button className="btn btn-primary text-xs shrink-0" onClick={() => nilai !== "" && onGrade(sub.id, +nilai, feedback)}>Simpan</button>
      </div>
    </div>
  );
}
