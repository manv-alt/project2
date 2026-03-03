import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { usedhashoard } from '@/context/Dhasboardcontext'
import { IndianRupee, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import React from 'react'
  
const Dashboard = () => {
  const {dashboard} = usedhashoard();
const info=[
    { title: "Total Users", value: dashboard.totalUsers , icon: User },
    { title: "Total Products", value: 350, icon: ShoppingBag },
    { title: "Total Orders", value: 875, icon: ShoppingCart },
    { title: "Total Revenue", value: "$45,000", icon: IndianRupee },
]
  return (
    <div className="space-y-6">
        
         
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of  gerogery mart store
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {info.map((item) => (
          <Card key={item.title} className="shadow-sm">
            < CardHeader className="flex flex-row items-center justify-between pb-2">
              < CardTitle className="text-sm font-medium text-gray-500">
                {item.title}
              </CardTitle>
              <item.icon className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {item.value??0}
              </div>
                </CardContent>
              
             
          </Card>
        ))}
</div>

    </div>
  )
}

export default Dashboard
