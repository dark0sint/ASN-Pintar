import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function CatSimulation() {
  const [exam, setExam] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remain, setRemain] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get("/cat/exam").then((r) => setExam(r.data));
    loadHistory();
  }, []);
  function loadHistory() { api.get("/cat/history").then((r) => setHistory(r.data)); }

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemain((r) => (r <= 1 ? (clearInterval(t), submit(), 0) : r - 1)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function start() {
    setAnswers({});
    setRemain(exam.durasiMenit * 60);
    setResult(null);
    setRunning(true);
  }

  async function submit() {
    setRunning(false);
    const { data } = await api.post("/cat/submit", { examId: exam.id, jawaban: answers });
    setResult(data);
    loadHistory();
  }

  if (!exam) return <p className="text-inksoft">Memuat bank soal...</p>;

  if (result) {
    const cats = Object.entries(result.perKategori as Record<string, { benar: number; total: number }>);
    return (
      <div className="panel">
        <h2 className="text-lg font-semibold mb-3">Hasil simulasi CAT</h2>
        <p className="font-display text-4xl">{result.totalSkor}%</p>
        <p className={`tag mt-2 ${result.lulus ? "tag-teal" : "bg-red-100 text-red-700"}`}>{result.lulus ? "Lulus ambang batas (≥70%)" : "Belum mencapai ambang batas (≥70%)"}</p>
        <div className="flex items-end gap-3 h-36 pt-3 mt-3">
          {cats.map(([k, v]) => (
            <div key={k} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full max-w-[34px] bg-primary rounded-t-sm" style={{ height: `${(v.benar / v.total) * 100}%` }} />
              <div className="text-[10.5px] text-inksoft text-center">{k}<br />{v.benar}/{v.total}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary mt-4" onClick={() => setResult(null)}>Kembali</button>
      </div>
    );
  }

  if (running) {
    const mm = String(Math.floor(remain / 60)).padStart(2, "0"), ss = String(remain % 60).padStart(2, "0");
    return (
      <div className="panel">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Simulasi CAT sedang berlangsung</h2>
          <span className="font-mono text-lg bg-ink text-bg px-3.5 py-1.5 rounded-sm">{mm}:{ss}</span>
        </div>
        {exam.soal.map((q: any) => (
          <div key={q.id} className="py-4 border-b border-line">
            <div className="font-semibold text-[14.5px] mb-2.5">
              <span className="tag tag-teal">{q.kategori}</span><br />{q.soal}
            </div>
            {q.opsi.map((o: string, oi: number) => (
              <div key={oi} onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} className={`px-3 py-2.5 border rounded-sm mb-1.5 text-[13.5px] cursor-pointer ${answers[q.id] === oi ? "border-primary bg-primarysoft" : "border-line hover:bg-surface2"}`}>{o}</div>
            ))}
          </div>
        ))}
        <button className="btn btn-primary mt-2" onClick={submit}>Selesai &amp; kumpulkan jawaban</button>
      </div>
    );
  }

  return (
    <div>
      <div className="panel mb-4">
        <h2 className="text-lg font-semibold mb-2">{exam.judul}</h2>
        <p className="text-[13.5px] text-inksoft mb-3">Simulasi ujian resmi kompetensi Teknis, Manajerial, dan Sosio-Kultural. Durasi {exam.durasiMenit} menit.</p>
        <button className="btn btn-primary" onClick={start}>Mulai simulasi CAT</button>
      </div>
      <div className="panel">
        <h2 className="text-lg font-semibold mb-3">Riwayat simulasi</h2>
        {history.length ? (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-[11px] text-inksoft border-b border-line"><th className="py-2">Tanggal</th><th>Skor</th><th>Status</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-line last:border-b-0">
                  <td className="py-2">{new Date(h.createdAt).toLocaleDateString("id-ID")}</td>
                  <td>{h.totalSkor}%</td>
                  <td>{h.lulus ? <span className="tag tag-teal">Lulus</span> : <span className="tag bg-red-100 text-red-700">Belum lulus</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-inksoft text-sm text-center py-6">Belum ada riwayat simulasi.</p>}
      </div>
    </div>
  );
}
