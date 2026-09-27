import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Mentoring() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);

  async function load() { const { data } = await api.get("/mentoring/mentors"); setMentors(data); }
  useEffect(() => { load(); }, []);

  async function book(slotId: string) {
    try {
      await api.post(`/mentoring/slots/${slotId}/book`);
      load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Gagal memesan slot.");
    }
  }

  return (
    <div className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Mentoring &amp; coaching</h2>
        <span className="text-xs text-inksoft">Jadwalkan sesi konsultasi privat</span>
      </div>
      {mentors.map((m) => (
        <div key={m.id} className="panel bg-surface2 mb-3">
          <h3 className="font-semibold text-[15px]">{m.nama}</h3>
          <p className="text-xs text-inksoft mb-2.5">{m.keahlian}</p>
          <div className="flex flex-wrap gap-2">
            {m.slots.map((s: any) => (
              <button
                key={s.id}
                disabled={!!s.bookedById}
                onClick={() => book(s.id)}
                className={`btn text-xs ${s.bookedById ? "btn-ghost" : "btn-secondary"}`}
              >
                {new Date(s.tanggal).toLocaleString("id-ID")}
                {s.bookedById && (s.bookedById === user?.id ? " · Dipesan Anda" : " · Terisi")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
