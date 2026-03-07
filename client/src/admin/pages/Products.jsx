import { useState, useEffect } from "react";
import { LayoutGrid, List, Plus, Pencil, Trash2 } from "lucide-react";
import { useProduct } from "@/context/ProductContext";
import { useCategory } from "@/context/CategoryContext";

const Product = () => {
  const [view, setView] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error state for form validation
  const [errors, setErrors] = useState({});
  
  // Global error from API
  const [apiError, setApiError] = useState("");
  
  // Success message
  const [successMsg, setSuccessMsg] = useState("");

  const { products, addProduct, updateProduct, deleteProduct } = useProduct();
  const { categories, fetchCategories } = useCategory();

  // Get parent categories (for dropdown)
  const parentCategories = categories.filter(cat => !cat.parent);
  
  // Get all subcategories
  const subcategories = categories.filter(cat => cat.parent);
  
  // Get subcategories based on selected parent
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent === parentId);
  };

  // Get category display name - handle both object and string
  const getCategoryDisplayName = (product) => {
    if (product.category && typeof product.category === 'object') {
      return product.category.name;
    }
    return product.category || 'Uncategorized';
  };

  // Get category slug for filtering
  const getCategorySlug = (product) => {
    if (product.category && typeof product.category === 'object') {
      return product.category.slug;
    }
    return product.category?.toLowerCase().replace(/\s+/g, '-') || '';
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    unit: "",
    category: "",
    image: null,
    imageFile: null,
  });

  // ---------- VALIDATION FUNCTION ----------
  const validateForm = () => {
    const newErrors = {};
    
    // Convert all values to string for validation (handles both string and number types from database)
    const nameVal = String(formData.name || "");
    const priceVal = String(formData.price || "");
    const unitVal = String(formData.unit || "");
    const categoryVal = String(formData.category || "");
    
    // Name validation
    if (!nameVal.trim()) {
      newErrors.name = "Product name is required";
    } else if (nameVal.trim().length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    }
    
    // Price validation
    if (!priceVal.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(priceVal) || parseFloat(priceVal) <= 0) {
      newErrors.price = "Please enter a valid price";
    }
    
    // Unit validation
    if (!unitVal.trim()) {
      newErrors.unit = "Unit is required (e.g., kg, piece)";
    }
    
    // Category validation
    if (!categoryVal.trim()) {
      newErrors.category = "Please select a category";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- HANDLERS ----------

  // Reset form when adding new product
  const handleAdd = () => {
    setFormData({
      id: null,
      name: "",
      price: "",
      unit: "",
      category: "",
      image: null,
      imageFile: null,
    });
    setErrors({});
    setApiError("");
    setSuccessMsg("");
    setShowForm(true);
  };

  // Pre-fill form when editing
  const handleEdit = (p) => {
    setFormData({
      id: p._id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      category: p.category,
      image: p.img,
      imageFile: null,
    });
    setErrors({});
    setApiError("");
    setSuccessMsg("");
    setShowForm(true);
  };

  // Handle delete with confirmation
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  // Base URL for images
  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  // Handle image selection
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Only image files (JPG, PNG, WebP) are allowed" });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 10MB" });
        return;
      }
      
      setFormData({
        ...formData,
        image: URL.createObjectURL(file),
        imageFile: file,
      });
      const { image, ...rest } = errors;
      setErrors(rest);
    }
  };

  // Handle name change
  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) setErrors({ ...errors, name: "" });
    setApiError("");
    setSuccessMsg("");
  };

  // Handle price change
  const handlePriceChange = (e) => {
    setFormData({ ...formData, price: e.target.value });
    if (errors.price) setErrors({ ...errors, price: "" });
    setApiError("");
    setSuccessMsg("");
  };

  // Handle unit change
  const handleUnitChange = (e) => {
    setFormData({ ...formData, unit: e.target.value });
    if (errors.unit) setErrors({ ...errors, unit: "" });
    setApiError("");
    setSuccessMsg("");
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
    if (errors.category) setErrors({ ...errors, category: "" });
    setApiError("");
    setSuccessMsg("");
  };

  // Handle form submission
  const handleSubmit = async () => {
    setApiError("");
    setSuccessMsg("");
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();

      form.append("name", String(formData.name).trim());
      form.append("price", String(formData.price).trim());
      form.append("unit", String(formData.unit).trim());
      form.append("category", formData.category);

      if (formData.imageFile) {
        form.append("image", formData.imageFile);
      }

      if (formData.id) {
        await updateProduct(formData.id, form);
        setSuccessMsg("Product updated successfully!");
      } else {
        await addProduct(form);
        setSuccessMsg("Product added successfully!");
      }

      setTimeout(() => {
        setShowForm(false);
        setFormData({
          id: null,
          name: "",
          price: "",
          unit: "",
          category: "",
          image: null,
          imageFile: null,
        });
        setErrors({});
      }, 1000);

    } catch (error) {
      console.error("Product save failed:", error);
      setApiError(error.response?.data?.message || "Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Close modal
  const handleClose = () => {
    setShowForm(false);
    setFormData({
      id: null,
      name: "",
      price: "",
      unit: "",
      category: "",
      image: null,
      imageFile: null,
    });
    setErrors({});
    setApiError("");
    setSuccessMsg("");
  };

  // Filter products - handle both populated object and legacy string (case-insensitive)
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    
    let matchCategory = false;
    
    if (category === "All" || category === undefined || category === "") {
      matchCategory = true;
    } else if (p.category && typeof p.category === 'object') {
      // Handle populated category (object with name and _id) - case insensitive
      const productCatName = p.category.name?.toLowerCase();
      const productCatId = p.category._id?.toString();
      
      // Find the selected category to get its _id
      const selectedCat = categories.find(cat => cat.name.toLowerCase() === category.toLowerCase());
      const selectedCatId = selectedCat?._id?.toString();
      
      matchCategory = productCatId === selectedCatId || productCatName === category.toLowerCase();
    } else {
      // Handle legacy string category - case insensitive
      matchCategory = p.category?.toLowerCase() === category.toLowerCase();
    }
    
    return matchSearch && matchCategory;
  });

  // ---------- UI ----------

  return (
    <div className="p-4 md:p-6 bg-[#f7f5f3] min-h-screen">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold">Product Management</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChange("grid")}
            className={`p-2 rounded ${view === "grid" ? "bg-green-600 text-white" : "bg-white"}`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>

          <button
            onClick={() => handleViewChange("list")}
            className={`p-2 rounded ${view === "list" ? "bg-green-600 text-white" : "bg-white"}`}
            title="List View"
          >
            <List size={18} />
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="px-3 py-2 border rounded w-60 bg-white"
        />
      </div>

      {/* CATEGORY PILLS */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          key="All"
          onClick={() => setCategory("All")}
          className={`px-4 py-1.5 rounded-full text-sm border ${category === "All" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full text-sm border ${category === cat.name ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No products found</div>
          ) : (
            filteredProducts.map((p) => (
              <div key={p._id} className="bg-white rounded-xl p-4 shadow">
                {p.img ? (
                  <img src={getImageUrl(p.img)} alt={p.name} className="h-32 w-full object-cover rounded mb-2" />
                ) : (
                  <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-600">₹ {p.price} / {p.unit}</p>
                <p className="text-xs text-gray-500">{getCategoryDisplayName(p)}</p>
                <div className="flex justify-between mt-3 text-sm">
                  <button onClick={() => handleEdit(p)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="flex items-center gap-1 text-red-600 hover:text-red-800">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            filteredProducts.map((p) => (
              <div key={p._id} className="bg-white rounded p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {p.img ? (
                    <img src={getImageUrl(p.img)} alt={p.name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No IMG</div>
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">₹ {p.price} / {p.unit} • {getCategoryDisplayName(p)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-800" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {formData.id ? "Edit Product" : "Add New Product"}
            </h2>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{apiError}</div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">{successMsg}</div>
            )}

            <div className="space-y-3">
              <div>
                <input
                  className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Product Name *"
                  value={formData.name}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <select
                  className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none ${errors.category ? "border-red-500" : ""}`}
                  value={formData.category}
                  onChange={handleCategoryChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select Category *</option>
                  {parentCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                  {subcategories.length > 0 && (
                    <optgroup label="Subcategories">
                      {subcategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          - {cat.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <input
                    className={`w-full border rounded-lg p-2 ${errors.price ? "border-red-500" : ""}`}
                    placeholder="Price *"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handlePriceChange}
                    disabled={isSubmitting}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    className={`w-full border rounded-lg p-2 ${errors.unit ? "border-red-500" : ""}`}
                    placeholder="Unit * (kg/piece)"
                    value={formData.unit}
                    onChange={handleUnitChange}
                    disabled={isSubmitting}
                  />
                  {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                </div>
              </div>

              <div>
                <input
                  type="file"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImage}
                  disabled={isSubmitting}
                />
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                <p className="text-gray-500 text-xs mt-1">Optional. Max 10MB (JPG, PNG, WebP)</p>
              </div>

              {formData.image && (
                <div className="relative">
                  <img src={formData.image} alt="Preview" className="h-28 w-full object-cover rounded-lg mt-2" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null, imageFile: null })}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50" disabled={isSubmitting}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg text-white hover:bg-green-700 disabled:opacity-50 ${isSubmitting ? "bg-green-400" : "bg-green-600"}`}
              >
                {isSubmitting ? "Saving..." : (formData.id ? "Update" : "Add Product")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
