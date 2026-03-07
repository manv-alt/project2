import api from "@/lib/axios";
import socket from "@/lib/Socket";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
 

const DhashboardAcess = createContext(null)

 
export const DhashboardProvider = ({children}) => {
     const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Use useCallback to prevent function recreation on each render
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/dashboard");
      console.log("NEW DATA:", res.data);
      setDashboard(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
     
// FIXED: Added empty dependency array [] - fetch data ONLY once on mount
// This prevents infinite loop that was caused by missing dependency array
useEffect(() => {
    fetchData();
    
    // Listen for real-time updates
    socket.on("dashboardUpdate", () => {
      console.log("SOCKET RECEIVED");
      fetchData();
    });
    
    // Cleanup socket listener on unmount
    return () => {
      socket.off("dashboardUpdate");
    };
}, [fetchData]); // fetchData is now stable due to useCallback

return(
    <DhashboardAcess.Provider value={{dashboard, fetchData, isLoading}} >
        {children}

    </DhashboardAcess.Provider>
)

}                                                                   
export const usedhashoard=()=>useContext(DhashboardAcess)
