import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("asnpintar_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("asnpintar_token");
      localStorage.removeItem("asnpintar_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
