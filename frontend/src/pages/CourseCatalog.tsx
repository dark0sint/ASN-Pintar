import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const CATS: [string, string][] = [["semua", "Semua"], ["teknis", "Teknis"], ["manajerial", "Manajerial"], ["sosio", "Sosio-Kultural"]];

export default function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState("semua");

  useEffect(() => { api.get("/courses").then((r) => setCourses(r.data)); }, []);

  const list = courses.filter((c) => filter === "semua" || c.kategori === filter);

  return (
    <div className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Katalog kelas</h2>
        <span className="text-xs text-inksoft">Video interaktif · E-book · Audio · PDF</span>
      </div>
      <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto">
        {CATS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3.5 py-2.5 text-[13px] font-semibold border-b-2 whitespace-nowrap ${filter === k ? "text-primarydark border-primary" : "text-inksoft border-transparent"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {list.map((c) => {
        const formats = Array.from(new Set(c.modules.map((m: any) => m.tipe)));
        return (
        <Link to={`/kelas/${c.id}`} key={c.id} className="flex gap-3 border border-line border-l-4 border-l-primary rounded-sm p-3.5 mb-2 hover:bg-surface2">
          <div className="font-mono text-[11px] text-inksoft w-12 pt-0.5">{c.jp} JP</div>
          <div>
            <div className="font-semibold text-sm">{c.judul}</div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="tag tag-teal">{c.kategori}</span>
              {formats.map((f: any) => <span key={f} className="tag">{f}</span>)}
              <span className="tag">{c.modules.length} modul</span>
            </div>
          </div>
        </Link>
        );
      })}
      {!list.length && <p className="text-inksoft text-sm text-center py-8">Tidak ada kelas pada kategori ini.</p>}
    </div>
  );
}
