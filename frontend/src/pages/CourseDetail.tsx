import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

const ICONS: Record<string, string> = { video: "🎬", ebook: "📖", audio: "🎧", pdf: "📄" };
const TABS: [string, string][] = [["materi", "Materi & Microlearning"], ["pretest", "Pre-Test"], ["posttest", "Post-Test"], ["tugas", "Tugas & Studi Kasus"], ["forum", "Forum Diskusi"]];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [tab, setTab] = useState("materi");
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<{ enrollment: any; completedModuleIds: string[] }>({ enrollment: null, completedModuleIds: [] });

  async function load() {
    const [c, p] = await Promise.all([api.get(`/courses/${id}`), api.get(`/progress/course/${id}`)]);
    setCourse(c.data);
    setProgress(p.data);
  }
  useEffect(() => { load(); }, [id]);

  if (!course) return <p className="text-inksoft">Memuat...</p>;

  async function toggleModule(moduleId: string) {
    const { data } = await api.post(`/progress/module/${moduleId}/toggle`);
    setProgress((p) => ({ ...p, completedModuleIds: data.completedModuleIds }));
  }

  async function issueCert() {
    await api.post(`/certificates/issue/${id}`);
    nav("/sertifikat");
  }

  const pct = Math.round((progress.completedModuleIds.length / course.modules.length) * 100) || 0;
  const canCert = progress.enrollment?.status === "selesai" && !progress.enrollment?.certIssued;

  return (
    <div>
      <Link to="/kelas" className="text-[12.5px] text-inksoft">← Kembali ke katalog</Link>
      <div className="panel mt-2.5">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-lg font-semibold">{course.judul}</h2>
          <span className="text-xs text-inksoft">{course.jp} JP · {course.kategori}</span>
        </div>
        <p className="text-[13.5px] text-inksoft">{course.deskripsi}</p>
        <div className="h-1.5 rounded bg-surface2 overflow-hidden mt-2">
          <div className="h-full bg-primary rounded" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11.5px] text-inksoft mt-1.5">
          Status: <strong>{progress.enrollment?.status || "belum"}</strong>
          {progress.enrollment?.preScore != null && ` · Pre-Test: ${progress.enrollment.preScore}%`}
          {progress.enrollment?.postScore != null && ` · Post-Test: ${progress.enrollment.postScore}%`}
        </p>
        {canCert && <button className="btn btn-primary mt-2" onClick={issueCert}>Terbitkan sertifikat digital</button>}
        {progress.enrollment?.certIssued && <Link to="/sertifikat" className="btn btn-secondary mt-2">Lihat sertifikat →</Link>}
      </div>

      <div className="panel mt-4">
        <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto">
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-2.5 text-[13px] font-semibold border-b-2 whitespace-nowrap ${tab === k ? "text-primarydark border-primary" : "text-inksoft border-transparent"}`}>{l}</button>
          ))}
        </div>

        {tab === "materi" && (
          <div>
            {course.modules.map((m: any, i: number) => {
              const done = progress.completedModuleIds.includes(m.id);
              return (
                <div key={m.id} className="flex gap-3.5 border border-line rounded-sm p-3.5 mb-2.5">
                  <div className="font-mono text-[11px] text-inksoft w-6 pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ICONS[m.tipe]} {m.judul}</div>
                    <div className="flex gap-2.5 text-[11.5px] text-inksoft mt-1.5">
                      <span className="tag">{m.tipe}</span><span>{m.menit} menit · microlearning</span>{done && <span className="tag tag-teal">Selesai</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button className={`btn btn-secondary text-xs ${done ? "btn-ghost" : ""}`} onClick={() => toggleModule(m.id)}>{done ? "Tandai ulang" : "Tandai selesai"}</button>
                  </div>
                </div>
              );
            })}
            <p className="text-[11.5px] text-inksoft mt-2">Materi dapat diunduh untuk dipelajari tanpa koneksi internet (mode offline) — implementasi PWA/service worker disarankan sebagai tahap lanjut, lihat README.</p>
          </div>
        )}

        {tab === "pretest" && <QuizTab courseId={id!} jenis="pre" bank={course.preTest} already={progress.enrollment?.preScore} onDone={load} />}
        {tab === "posttest" && (
          progress.completedModuleIds.length < course.modules.length
            ? <p className="text-inksoft text-sm text-center py-8">🔒 Selesaikan seluruh materi terlebih dahulu untuk membuka Post-Test.</p>
            : <QuizTab courseId={id!} jenis="post" bank={course.postTest} already={progress.enrollment?.postScore} onDone={load} />
        )}
        {tab === "tugas" && <TugasTab courseId={id!} />}
        {tab === "forum" && <ForumTab courseId={id!} />}
      </div>
    </div>
  );
}

function QuizTab({ courseId, jenis, bank, already, onDone }: { courseId: string; jenis: "pre" | "post"; bank: any[]; already?: number; onDone: () => void }) {
  const [answers, setAnswers] = useState<number[]>(new Array(bank.length).fill(-1));
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(already == null);

  async function submit() {
    const { data } = await api.post("/quiz/submit", { courseId, jenis, jawaban: answers });
    setResult(data);
    onDone();
  }

  if (already != null && !showForm) {
    return (
      <div>
        <p className="text-sm">Anda telah mengerjakan bagian ini dengan skor <strong>{already}%</strong>.</p>
        <button className="btn btn-secondary text-xs mt-2" onClick={() => setShowForm(true)}>Ulangi</button>
      </div>
    );
  }

  return (
    <div>
      {bank.map((q, i) => (
        <div key={q.id || i} className="py-4 border-b border-line last:border-b-0">
          <div className="font-semibold text-[14.5px] mb-2.5">{i + 1}. {q.soal}</div>
          {q.opsi.map((o: string, oi: number) => (
            <div
              key={oi}
              onClick={() => setAnswers((a) => a.map((v, ix) => (ix === i ? oi : v)))}
              className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-sm mb-1.5 text-[13.5px] cursor-pointer ${answers[i] === oi ? "border-primary bg-primarysoft" : "border-line hover:bg-surface2"}`}
            >
              {o}
            </div>
          ))}
        </div>
      ))}
      <button className="btn btn-primary mt-2" onClick={submit} disabled={answers.includes(-1)}>Selesai &amp; lihat skor</button>
      {result && <p className="text-sm mt-3">Skor Anda: <strong>{result.skor}%</strong>{result.lulus != null && (result.lulus ? " — Lulus 🎉" : " — Belum lulus, coba lagi setelah meninjau materi.")}</p>}
    </div>
  );
}

function TugasTab({ courseId }: { courseId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [texts, setTexts] = useState<Record<string, string>>({});

  async function load() { const { data } = await api.get(`/tasks/course/${courseId}`); setTasks(data); }
  useEffect(() => { load(); }, [courseId]);

  async function submit(taskId: string) {
    if (!texts[taskId]?.trim()) return;
    await api.post(`/tasks/${taskId}/submit`, { teks: texts[taskId] });
    load();
  }

  if (!tasks.length) return <p className="text-inksoft text-sm text-center py-8">Belum ada tugas untuk kelas ini.</p>;

  return (
    <div className="space-y-3">
      {tasks.map((t) => {
        const mine = t.submissions?.[0];
        return (
          <div key={t.id} className="panel bg-surface2">
            <h3 className="font-semibold text-[15px] mb-2">{t.judul}</h3>
            <p className="text-[13px] text-inksoft mb-3">{t.instruksi}</p>
            {mine ? (
              <div>
                <p className="text-[12.5px]"><strong>Jawaban Anda:</strong> {mine.teks}</p>
                <p className={`tag ${mine.status === "dinilai" ? "tag-teal" : "tag-gold"} mt-1.5`}>
                  {mine.status === "dinilai" ? `Dinilai: ${mine.nilai}/100` : "Menunggu penilaian mentor"}
                </p>
                {mine.feedback && <p className="text-[12.5px] text-inksoft mt-1.5">Catatan mentor: {mine.feedback}</p>}
              </div>
            ) : (
              <div>
                <textarea rows={3} placeholder="Tulis analisis / studi kasus Anda di sini..." value={texts[t.id] || ""} onChange={(e) => setTexts((s) => ({ ...s, [t.id]: e.target.value }))} />
                <button className="btn btn-primary text-xs mt-2" onClick={() => submit(t.id)}>Kumpulkan tugas</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ForumTab({ courseId }: { courseId: string }) {
  const [threads, setThreads] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  async function load() { const { data } = await api.get(`/forum/course/${courseId}`); setThreads(data); }
  useEffect(() => { load(); }, [courseId]);

  async function reply(threadId: string) {
    if (!replies[threadId]?.trim()) return;
    await api.post(`/forum/thread/${threadId}/reply`, { isi: replies[threadId] });
    setReplies((r) => ({ ...r, [threadId]: "" }));
    load();
  }
  async function newThread() {
    if (!newTitle.trim() || !newBody.trim()) return;
    await api.post(`/forum/course/${courseId}/thread`, { judul: newTitle, isi: newBody });
    setNewTitle(""); setNewBody(""); load();
  }

  return (
    <div className="space-y-3">
      {threads.map((f) => (
        <div key={f.id} className="panel bg-surface2">
          <h3 className="font-semibold text-[15px] mb-2">{f.judul}</h3>
          {f.posts.map((p: any) => (
            <div key={p.id} className="py-2 border-b border-line text-[13px]">
              <strong>{p.user?.nama}</strong> <span className="text-inksoft text-[11px]">{new Date(p.createdAt).toLocaleDateString("id-ID")}</span>
              <br />{p.isi}
            </div>
          ))}
          <textarea rows={2} placeholder="Tulis balasan..." className="mt-2" value={replies[f.id] || ""} onChange={(e) => setReplies((r) => ({ ...r, [f.id]: e.target.value }))} />
          <button className="btn btn-primary text-xs mt-2" onClick={() => reply(f.id)}>Kirim balasan</button>
        </div>
      ))}
      <div className="panel bg-surface2">
        <h3 className="font-semibold text-[15px] mb-2">Mulai diskusi baru</h3>
        <input placeholder="Judul diskusi" className="mb-2" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <textarea rows={2} placeholder="Tulis pertanyaan atau topik diskusi..." value={newBody} onChange={(e) => setNewBody(e.target.value)} />
        <button className="btn btn-primary text-xs mt-2" onClick={newThread}>Publikasikan</button>
      </div>
    </div>
  );
}
