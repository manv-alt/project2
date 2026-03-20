import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

 api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛑 HARD STOP: If the error came from a refresh attempt, stop everything
    if (originalRequest.url.includes("/auth/refresh")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Use window.location.replace to prevent back-button loops
      // if (window.location.pathname !== "/login") {
      //    window.location.replace("/login");
      // }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use standard axios to avoid the request interceptor adding the old token
        const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("userLogout"));
        return Promise.reject(err); 
      }
    }
    return Promise.reject(error);
  }
);

export default api;