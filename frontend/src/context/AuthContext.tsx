import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";

export interface CurrentUser {
  id: string;
  nama: string;
  email: string;
  role: "peserta" | "admin";
  nip?: string;
  jabatan?: string;
  instansi?: string;
  points: number;
  jpTahunIni: number;
  jpTarget: number;
}

interface AuthCtx {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = localStorage.getItem("asnpintar_token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/users/me");
      setUser(data);
    } catch {
      localStorage.removeItem("asnpintar_token");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("asnpintar_token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("asnpintar_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
