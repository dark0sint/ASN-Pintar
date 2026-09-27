import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function AdminPegawai() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/pegawai").then((r) => setRows(r.data)); }, []);

  return (
    <div className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Data pegawai</h2>
        <span className="text-xs text-inksoft">Pantauan kepatuhan &amp; perkembangan belajar</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] text-inksoft border-b border-line">
              <th className="py-2">Nama</th><th>NIP</th><th>Jabatan</th><th>Instansi</th><th>Kelas selesai</th><th>JP</th><th>Poin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-b-0">
                <td className="py-2">{u.nama}</td>
                <td className="font-mono">{u.nip}</td>
                <td>{u.jabatan}</td>
                <td>{u.instansi}</td>
                <td>{u.kelasSelesai}</td>
                <td>{u.jpTahunIni}/{u.jpTarget}</td>
                <td>{u.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
