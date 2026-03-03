import api from "@/lib/axios";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    inStock: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/inventory");
      setInventory(data || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory stats
  const fetchStats = async () => {
    try {
      const { data } = await api.get("/inventory/stats");
      setStats(data || {
        totalProducts: 0,
        lowStockItems: 0,
        outOfStock: 0,
        inStock: 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/inventory/products");
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Add stock to a product
  const addStock = async (productId, quantity) => {
    try {
      await api.post("/inventory/addstock", {
        productId,
        quantity: parseInt(quantity),
      });
      toast.success("Stock added successfully");
      await fetchInventory();
      await fetchStats();
      return true;
    } catch (error) {
      console.error("Failed to add stock:", error);
      toast.error("Failed to add stock");
      return false;
    }
  };

  // Add stock from Excel file
  const addStockFromExcel = async (formData) => {
    try {
      await api.post("/inventory/addstock", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Stock updated from Excel successfully!");
      await fetchInventory();
      await fetchStats();
      return true;
    } catch (error) {
      console.error("Excel upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload Excel file");
      return false;
    }
  };

  // Fetch all data
  const fetchAll = async () => {
    await Promise.all([
      fetchInventory(),
      fetchStats(),
      fetchProducts()
    ]);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        products,
        stats,
        loading,
        fetchInventory,
        fetchStats,
        fetchProducts,
        addStock,
        addStockFromExcel,
        fetchAll,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
