import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, ShoppingBag, ShoppingCart, Users, AlertTriangle, Package } from "lucide-react";
import adminApi from "@/lib/adminAxios";
import socket from "@/lib/Socket";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newOrdersToday: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.get("/admin/dashboard-stats");
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen for real-time updates
    socket.on("dashboardUpdate", () => {
      console.log("Dashboard update received via socket");
      fetchStats();
    });

    // Polling for dashboard updates
    const intervalId = setInterval(() => {
      fetchStats();
    }, refreshInterval * 1000);

    return () => {
      socket.off("dashboardUpdate");
      clearInterval(intervalId);
    };
  }, [fetchStats, refreshInterval]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const info = [
    { 
      title: "Total Orders", 
      value: stats.totalOrders, 
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      title: "Total Revenue", 
      value: formatCurrency(stats.totalRevenue), 
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      title: "Total Products", 
      value: stats.totalProducts, 
      icon: ShoppingBag,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      title: "Total Users", 
      value: stats.totalUsers, 
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    { 
      title: "New Orders Today", 
      value: stats.newOrdersToday, 
      icon: Package,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100"
    },
    { 
      title: "Low Stock Products", 
      value: stats.lowStockCount, 
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of Grocery Mart store
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {info.map((item) => (
          <Card key={item.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value ?? 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders?.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        Order #{order.id?.toString().slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user} • {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts?.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-orange-600">
                        Only {product.quantity} left
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-orange-200 text-orange-800 rounded-full">
                      Low Stock
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

