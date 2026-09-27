import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("dewi@instansi.go.id");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal masuk. Periksa email/kata sandi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-surface border border-line p-8">
        <div className="font-display text-2xl font-bold text-primarydark">ASN Pintar</div>
        <div className="text-sm text-inksoft mb-6">Pelatihan digital ASN — mandiri, fleksibel, terukur.</div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-inksoft block mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-inksoft block mb-1">Kata sandi</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="btn btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="text-[11.5px] text-inksoft mt-4 leading-relaxed">
          Akun contoh (setelah `prisma db seed`): dewi@instansi.go.id / admin@instansi.go.id — kata sandi: password123
        </p>
      </div>
    </div>
  );
}
