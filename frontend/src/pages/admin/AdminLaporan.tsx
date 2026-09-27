import { api } from "../../api/client";

export default function AdminLaporan() {
  async function downloadCsv() {
    const res = await api.get("/admin/laporan/csv", { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url; a.download = "laporan-asn-pintar.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Laporan &amp; ekspor</h2>
        <span className="text-xs text-inksoft">Untuk kebutuhan audit administrasi</span>
      </div>
      <p className="text-[13px] text-inksoft mb-3">Unduh laporan perkembangan kompetensi seluruh pegawai untuk kebutuhan audit.</p>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={downloadCsv}>Unduh sebagai Excel (CSV)</button>
        <button className="btn btn-secondary" onClick={() => window.print()}>Cetak / simpan sebagai PDF</button>
      </div>
      <p className="text-[11.5px] text-inksoft mt-3">
        Untuk ekspor PDF terformat (bukan cetak halaman biasa), tambahkan endpoint serupa
        <code className="mx-1">/admin/laporan/csv</code> di backend menggunakan library <code>pdfkit</code>
        yang sudah terpasang (lihat contoh pemakaiannya di <code>lib/certificate.ts</code>).
      </p>
    </div>
  );
}
