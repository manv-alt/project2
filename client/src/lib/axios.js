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
    
    // ✅ Handle network/CORS errors (no response)
    if (!error.response) {
      console.error("Network/CORS error:", error.message);
      return Promise.reject(error);
    }
    
    // ✅ If refresh endpoint itself fails → logout immediately
    if (originalRequest.url?.includes("/auth/refresh")) {
      console.error("Refresh token failed");
      localStorage.removeItem("accessToken");
      window.location.href = "/login"; // or "/"
      return Promise.reject(error);
    }
    
    // ✅ Handle 401 unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // ✅ Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      // ✅ First 401 → start refresh
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log("🔄 Refreshing token...");
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true } // ✅ Direct call bypasses interceptors
        );
        
        const newToken = refreshResponse.data.accessToken;
        
        // ✅ Update localStorage and default headers
        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        console.log("✅ Token refreshed successfully");
        
        // ✅ Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("❌ Refresh failed:", refreshError);
        processQueue(refreshError, null);
        
        // ✅ Logout on refresh failure
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // ✅ Other errors pass through
    return Promise.reject(error);
  }
);

export { api, SOCKET_URL };
export default api;
