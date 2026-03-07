import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";

const Categories = () => {
  const [showForm, setShowForm] = useState(false);
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get parent categories only (no parent) for main categories
  const parentCategories = categories.filter(cat => !cat.parent);
  // Get subcategories (categories with parent)
  const subcategories = categories.filter(cat => cat.parent);

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    image: null,
    imageFile: null,
    parent: "",
  });

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http') || imgPath.startsWith('blob:')) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  // Get parent category name
  const getParentName = (parentId) => {
    const parent = categories.find(cat => cat._id === parentId);
    return parent ? parent.name : 'None';
  };

  // ---------- handlers ----------
  const handleAdd = () => {
    setFormData({
      _id: null,
      name: "",
      image: null,
      imageFile: null,
      parent: "",
    });
    setShowForm(true);
  };

  const handleEdit = (cat) => {
    setFormData({
      _id: cat._id,
      name: cat.name,
      image: getImageUrl(cat.image),
      imageFile: null,
      parent: cat.parent || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file), imageFile: file });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name.trim());
    
    if (formData.parent) {
      data.append('parent', formData.parent);
    }

    if (formData.imageFile) {
      data.append('image', formData.imageFile);
    }

    try {
      if (formData._id) {
        await updateCategory(formData._id, data);
      } else {
        await addCategory(data);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save category", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <div className="p-6 bg-[#f7f5f3] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Category Management</h1>
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-green-700"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* MAIN CATEGORIES */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Main Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && parentCategories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading categories...</div>
          ) : parentCategories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No categories found. Add one to get started.</div>
          ) : (
            parentCategories.map((cat) => (
              <div key={cat._id} className="bg-white rounded-xl p-4 shadow border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-2">
                  {cat.image ? (
                    <img 
                      src={getImageUrl(cat.image)} 
                      alt={cat.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-xs text-gray-500">/{cat.slug}</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 flex items-center gap-1 hover:text-blue-800"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-600 flex items-center gap-1 hover:text-red-800"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SUBCATEGORIES */}
      {subcategories.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Subcategories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subcategories.map((cat) => (
              <div key={cat._id} className="bg-white rounded-xl p-4 shadow border-l-4 border-blue-400">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-xs text-gray-500">Parent: {getParentName(cat.parent)}</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 flex items-center gap-1 hover:text-blue-800"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-600 flex items-center gap-1 hover:text-red-800"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {formData._id ? "Edit Category" : "Add New Category"}
            </h2>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Parent Category (Optional - for Subcategory) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category <span className="text-gray-500">(Optional - leave empty for main category)</span>
                </label>
                <select
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="">None (Main Category)</option>
                  {parentCategories.map((cat) => (
                    <option 
                      key={cat._id} 
                      value={cat._id}
                      disabled={formData._id === cat._id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image <span className="text-gray-500">(Used for navbar & cards)</span>
                </label>
                <input 
                  type="file" 
                  onChange={handleImage} 
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isSubmitting}
                />
                <p className="text-gray-500 text-xs mt-1">Square image recommended</p>
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="relative">
                  <img src={getImageUrl(formData.image)} alt="Preview" className="h-28 w-full object-cover rounded-lg mt-2" />
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
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-green-400 flex items-center gap-2"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

