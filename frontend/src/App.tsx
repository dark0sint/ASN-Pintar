import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetail from "./pages/CourseDetail";
import CatSimulation from "./pages/CatSimulation";
import Certificates from "./pages/Certificates";
import LiveClass from "./pages/LiveClass";
import Mentoring from "./pages/Mentoring";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPegawai from "./pages/admin/AdminPegawai";
import AdminLaporan from "./pages/admin/AdminLaporan";

function Protected({ children, role }: { children: JSX.Element; role?: "admin" | "peserta" }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-inksoft">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <Login />} />

      <Route element={<Protected role="peserta"><Layout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kelas" element={<CourseCatalog />} />
        <Route path="/kelas/:id" element={<CourseDetail />} />
        <Route path="/cat" element={<CatSimulation />} />
        <Route path="/sertifikat" element={<Certificates />} />
        <Route path="/live" element={<LiveClass />} />
        <Route path="/mentoring" element={<Mentoring />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>

      <Route element={<Protected role="admin"><Layout /></Protected>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pegawai" element={<AdminPegawai />} />
        <Route path="/admin/laporan" element={<AdminLaporan />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} replace />} />
    </Routes>
  );
}
