import api from "@/lib/axios";
import socket from "@/lib/Socket";
import { createContext, useContext, useEffect, useState } from "react";
 
 

const DhashboardAcess = createContext(null)

 
export const DhashboardProvider = ({children}) => {
     const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

const fetchData = async () => {
    try {
      const res = await api.get("/dashboard"); // adjust route if needed
      console.log("NEW DATA:", res.data);
  setDashboard(res.data);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };
     

useEffect(()=>{
    fetchData();
    socket.on("dashboardUpdate", () => {
    console.log("SOCKET RECEIVED");
     fetchData();
    } )
     return () => {
      socket.off("dashboardUpdate");
    };  
})

return(
    <DhashboardAcess.Provider value={{dashboard,fetchData}} >
        {children}

    </DhashboardAcess.Provider>
)

}                                                                   
export const usedhashoard=()=>useContext(DhashboardAcess)