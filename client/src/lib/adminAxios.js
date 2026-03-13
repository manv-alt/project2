import axios from "axios";

const adminApi = axios.create({
    baseURL: "/api",  // Use relative path - works on localhost:5173 and Render domain
    withCredentials: true,
});

// Attach admin token automatically
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("adminRefreshToken");
        if (refreshToken) {
          
           const res = await axios.post(
  "/api/admin/refresh",
            { refreshToken },
            { withCredentials: true }
          );

          localStorage.setItem("adminAccessToken", res.data.accessToken);
          localStorage.setItem("adminRefreshToken", res.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        window.location.href = "/admin";
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;

