import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'

const Adminlayouts = () => {
  return (
    <div>
        <SidebarProvider>
            <div className="flex min-h-screen w-full ">
                <SideBar/>
                <SidebarInset className="flex-1">
                    <header className="flex h-16 items-center gap-4 border-b  px-6">
            <SidebarTrigger/>
            <div className="h-6 w-px bg-green-600" />
            <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          </header>
          <main className="p-6">
            {/* Dashboard.jsx will "pop" into this Outlet */}
            <Outlet/>
          </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
      
    </div>
  )
}

 export default Adminlayouts

 
   