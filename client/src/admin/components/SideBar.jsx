 
import React from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { LayoutDashboard, List, ListOrderedIcon, Package, Settings, ShoppingBag, User, Warehouse } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const SideBar = () => {
const menuItems = [
  { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  
  { title: "Products", path: "/admin/Product", icon: ShoppingBag },
  { title: "Category Mangement", path: "/admin/Categories", icon: List },
  { title: "Order Mangament", path: "/admin/order", icon:Package },
  { title: "Inventory", path: "/admin/inventory", icon: Warehouse },
  { title: "Settings", path: "/admin/settings", icon: Settings },
]

  return (
    <div>
      <Sidebar >
        <SidebarContent className="bg-green-900 text-green-100 min-h-screen">
             <div className="px-4 py-5 text-xl font-semibold tracking-wide">
          GroceryMart
        </div>
<SidebarGroup>
     <SidebarGroupLabel className="text-green-400">
            Menu
          </SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item)=>(
                <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3  rounded-md px-3 py-5 text-xl transition 
                            ${
                                isActive
                                    ? "bg-green-600 text-white shadow-md"
                                    : " hover:bg-green-700 text-green-300"
                            }`
                            }
                            >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            </NavLink>
                    </SidebarMenuButton>

                </SidebarMenuItem>
            ))}
          </SidebarMenu>
</SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}

export default SideBar
