import { createContext, useContext, useEffect, useState, useCallback } from "react";
import adminApi from "@/lib/adminAxios";
import { toast } from "sonner";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto login on refresh
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminAccessToken");
      if (token) {
        // For now, we'll just check if token exists
        // In production, you'd verify with the server
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const res = await adminApi.post("/admin/login", { username, password });
      
      localStorage.setItem("adminAccessToken", res.data.accessToken);
      localStorage.setItem("adminRefreshToken", res.data.refreshToken);
      
      setAdmin(res.data.admin);
      setIsAuthenticated(true);
      toast.success("Admin logged in successfully");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.post("/admin/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      setAdmin(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
    }
  };

  const fetchAdmin = useCallback(async () => {
    try {
      const res = await adminApi.get("/admin/dashboard-stats");
      return res.data;
    } catch (error) {
      console.error("Error fetching admin data:", error);
      return null;
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        fetchAdmin,
        setAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

