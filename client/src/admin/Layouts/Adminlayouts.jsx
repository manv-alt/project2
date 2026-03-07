import { useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminLoginModal from "../components/AdminLoginModal";
import AdminNavbar from "../components/AdminNavbar";

const Adminlayouts = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show login modal if not authenticated
  if (!isAuthenticated && !loading) {
    return <AdminLoginModal />;
  }

  return (
    <div>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <div className="flex min-h-screen w-full">
          <SideBar />
          <SidebarInset className="flex-1">
            <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Adminlayouts;

