import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const [rank, setRank] = useState<any[]>([]);

  useEffect(() => { api.get("/gamification/leaderboard").then((r) => setRank(r.data)); }, []);

  return (
    <div className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Papan peringkat</h2>
        <span className="text-xs text-inksoft">Berdasarkan poin gamifikasi</span>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-inksoft border-b border-line">
            <th className="py-2">#</th><th>Nama</th><th>Instansi</th><th>Poin</th><th>Lencana</th>
          </tr>
        </thead>
        <tbody>
          {rank.map((r, i) => (
            <tr key={r.id} className={`border-b border-line last:border-b-0 ${r.id === user?.id ? "bg-primarysoft" : ""}`}>
              <td className="py-2">{i + 1}</td>
              <td>{r.nama}</td>
              <td>{r.instansi}</td>
              <td>{r.points}</td>
              <td>{r._count?.badges ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
