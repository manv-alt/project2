import api from "@/lib/axios";
import { createContext, useContext, useState, useEffect } from "react";
 
const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/product");
      setProducts(data.products || []);
      setError(null);
    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product - throws error for handling in component
  const addProduct = async (formData) => {
    try {
      setError(null);
      const { data } = await api.post("/product", formData);
      
      // Check for success response
      if (data.success || data.product) {
        setProducts((prev) => [data.product, ...prev]);
        return data;
      } else {
        throw new Error(data.message || "Failed to add product");
      }
    } catch (err) {
      console.log("FRONTEND ADD ERROR:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to add product";
      setError(errorMessage);
      throw err; // Re-throw to let component handle it
    }
  };

  // Update product - throws error for handling in component
  const updateProduct = async (id, formData) => {
    try {
      setError(null);
      const { data } = await api.put(`/product/${id}`, formData);

      if (data.success || data.product) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? data.product : p
          )
        );
        return data;
      } else {
        throw new Error(data.message || "Failed to update product");
      }
    } catch (err) {
      console.error("FRONTEND UPDATE ERROR:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update product";
      setError(errorMessage);
      throw err;
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      setError(null);
      await api.delete(`/product/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("FRONTEND DELETE ERROR:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete product";
      setError(errorMessage);
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        clearError
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
