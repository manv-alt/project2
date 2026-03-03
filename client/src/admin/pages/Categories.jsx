import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useCategory } from "@/context/CategoryContext";

const Categories = () => {
  const [showForm, setShowForm] = useState(false);
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    image: null,
    imageFile: null,
    icon: "",
    subcategories: [],
    subInput: "",
  });

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http') || imgPath.startsWith('blob:')) return imgPath;
    return `http://localhost:5000${imgPath}`;
  };

  // ---------- handlers ----------
  const handleAdd = () => {
    setFormData({
      _id: null,
      name: "",
      image: null,
      icon: "",
      subcategories: [],
      subInput: "",
    });
    setShowForm(true);
  };

  const handleEdit = (cat) => {
    setFormData({
      ...cat,
      image: getImageUrl(cat.image),
      imageFile: null,
      subInput: ""
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

  const addSubCategory = () => {
    if (!formData.subInput) return;
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, formData.subInput],
      subInput: "",
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('icon', formData.icon);
    data.append('subcategories', JSON.stringify(formData.subcategories));

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
      // Error is already toasted from context
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

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && categories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No categories found. Add one to get started.</div>
        ) : (
          categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{cat.icon}</span>
              <h3 className="font-semibold">{cat.name}</h3>
            </div>

            {cat.image && (
              <img
                src={getImageUrl(cat.image)}
                alt={cat.name}
                className="h-24 w-full object-cover rounded mb-2"
              />
            )}

            <div className="flex flex-wrap gap-2 text-xs mb-3">
              {cat.subcategories?.map((sub, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-700 px-2 py-1 rounded"
                >
                  {sub}
                </span>
              ))}
            </div>

            <div className="flex justify-between text-sm">
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
        )))}
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {formData._id ? "Edit Category" : "Add New Category"}
            </h2>

            <div className="space-y-3">
              <input
                className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Category Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />

              <input
                className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Icon (e.g., 🥦)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                disabled={isSubmitting}
              />

              <input 
                type="file" 
                onChange={handleImage} 
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSubmitting}
              />

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

              {/* SUB CATEGORY */}
              <div className="flex gap-2">
                <input
                  className="border rounded-lg flex-1 p-2"
                  placeholder="Add sub-category"
                  value={formData.subInput}
                  onChange={(e) => setFormData({ ...formData, subInput: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addSubCategory()}
                  disabled={isSubmitting}
                />
                <button
                  onClick={addSubCategory}
                  className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {formData.subcategories.map((s, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded">
                  {s}
                </span>
              ))}
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
                disabled={isSubmitting || !formData.name}
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
