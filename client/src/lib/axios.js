import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // 🔑 refresh token cookie
});

// attach access token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
