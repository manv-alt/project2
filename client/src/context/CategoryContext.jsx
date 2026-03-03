import api from "@/lib/axios";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (formData) => {
    try {
      setLoading(true);
      const { data } = await api.post("/categories", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCategories((prev) => [data, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      toast.success("Category added successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add category";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      setLoading(true);
      const { data } = await api.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCategories((prev) => prev.map((c) => (c._id === id ? data : c)));
      toast.success("Category updated successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update category";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete category";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoryContext.Provider
      value={{ categories, loading, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);