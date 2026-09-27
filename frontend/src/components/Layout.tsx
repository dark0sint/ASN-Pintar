import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PESERTA_NAV = [
  ["01", "Dasbor Saya", "/dashboard"],
  ["02", "Katalog Kelas", "/kelas"],
  ["03", "Simulasi CAT", "/cat"],
  ["04", "Kelas Daring", "/live"],
  ["05", "Sertifikat", "/sertifikat"],
  ["06", "Mentoring", "/mentoring"],
  ["07", "Papan Peringkat", "/leaderboard"],
];

const ADMIN_NAV = [
  ["01", "Ringkasan Instansi", "/admin"],
  ["02", "Data Pegawai", "/admin/pegawai"],
  ["03", "Laporan & Ekspor", "/admin/laporan"],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const items = user?.role === "admin" ? ADMIN_NAV : PESERTA_NAV;

  return (
    <div className="flex min-h-screen">
      <aside className="w-[230px] shrink-0 bg-surface border-r border-line flex flex-col fixed top-0 bottom-0 left-0">
        <div className="px-5 pt-6 pb-4 border-b border-line">
          <div className="font-display text-xl font-bold text-primarydark">ASN Pintar</div>
          <div className="text-[11px] text-inksoft mt-0.5">Pelatihan Digital ASN</div>
        </div>
        <ul className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {items.map(([idx, label, path]) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-sm text-[13.5px] font-medium border-l-[3px] ${
                    isActive ? "bg-primarysoft text-primarydark border-primary" : "text-inksoft border-transparent hover:bg-surface2"
                  }`
                }
              >
                <span className="font-mono text-[10.5px] w-4">{idx}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-line text-[11px] text-inksoft">
          Masuk sebagai <strong>{user?.nama}</strong>
          <button
            className="btn btn-ghost w-full mt-2 justify-center"
            onClick={() => { logout(); nav("/login"); }}
          >
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-[230px] p-7">
        <Outlet />
      </main>
    </div>
  );
}
