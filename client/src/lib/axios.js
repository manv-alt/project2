import axios from "axios";

// ✅ Production-ready baseURL using Vite env vars
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

console.log("API_BASE_URL:", API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ Required for cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor - adds access token
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

// ✅ Response interceptor - handles 401 refresh + prevents loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Check if the error is 401 and not already a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If the 401 came FROM the refresh endpoint itself, STOP immediately
      if (originalRequest.url.includes("/auth/refresh")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a clean axios instance to avoid interceptor interference
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        localStorage.setItem("accessToken", newToken);
        
        // Update the failed requests in queue
        processQueue(null, newToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api, SOCKET_URL };
export default api;
