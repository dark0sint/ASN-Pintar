import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function LiveClass() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => { api.get("/live-classes").then((r) => setClasses(r.data)); }, []);

  async function join(id: string) {
    const { data } = await api.get(`/live-classes/${id}/join`);
    window.open(data.joinUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Kelas tatap maya &amp; webinar</h2>
        <span className="text-xs text-inksoft">Terintegrasi Jitsi Meet self-hosted instansi</span>
      </div>
      {classes.map((lc) => (
        <div key={lc.id} className="flex gap-3.5 border border-line rounded-sm p-3.5 mb-2.5 items-center">
          <div className="text-xl">📅</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{lc.judul}</div>
            <div className="flex flex-wrap gap-2.5 text-[11.5px] text-inksoft mt-1.5">
              <span className="tag tag-slate">{lc.course?.judul}</span>
              <span>{new Date(lc.tanggal).toLocaleString("id-ID")}</span>
              <span>Pengajar: {lc.pengajar}</span>
            </div>
          </div>
          <button className="btn btn-primary text-xs" onClick={() => join(lc.id)}>Gabung sekarang</button>
        </div>
      ))}
      {!classes.length && <p className="text-inksoft text-sm text-center py-8">Belum ada jadwal kelas daring.</p>}
    </div>
  );
}
