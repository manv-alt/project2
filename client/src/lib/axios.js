import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // 🔑 refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// attach access token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auto token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

   if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;

  try {
    const res = await api.post("/auth/refresh");

    localStorage.setItem("accessToken", res.data.accessToken);

    originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
    return api(originalRequest);
  } catch (refreshError) {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  }
}

    return Promise.reject(error);
  }
);

export default api;
