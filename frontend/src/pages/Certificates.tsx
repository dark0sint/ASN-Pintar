import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Certificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [courses, setCourses] = useState<Record<string, any>>({});

  useEffect(() => {
    api.get("/certificates/mine").then((r) => setCerts(r.data));
    api.get("/courses").then((r) => {
      const map: Record<string, any> = {};
      r.data.forEach((c: any) => (map[c.id] = c));
      setCourses(map);
    });
  }, []);

  const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api").replace(/\/api$/, "");

  return (
    <div className="panel">
      <h2 className="text-lg font-semibold mb-3">Sertifikat digital saya</h2>
      {certs.length ? certs.map((c) => (
        <div key={c.id} className="flex gap-3.5 border border-line rounded-sm p-3.5 mb-2.5 items-center">
          <div className="text-2xl">🎓</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{courses[c.courseId]?.judul || "Kelas"}</div>
            <div className="text-[11.5px] text-inksoft">Kode verifikasi: <span className="font-mono">{c.kodeVerifikasi}</span></div>
          </div>
          {c.pdfPath && (
            <a className="btn btn-secondary text-xs" href={`${apiBase}${c.pdfPath}`} target="_blank" rel="noreferrer">Unduh PDF</a>
          )}
        </div>
      )) : (
        <p className="text-inksoft text-sm text-center py-8">🎓 Selesaikan kelas dan post-test untuk meraih sertifikat digital pertama Anda.</p>
      )}
    </div>
  );
}
