import { useState, useEffect } from "react";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";
 import api from "@/lib/axios";

export default function Inventory() {
  const [openModal, setOpenModal] = useState(false);
  const [openExcelModal, setOpenExcelModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
  });

  const { inventory, products, stats, loading, fetchAll, addStock, addStockFromExcel } = useInventory();

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const success = await addStock(formData.productId, formData.quantity);
      if (success) {
        setOpenModal(false);
        setFormData({ productId: "", quantity: "" });
      }
    } catch (error) {
      console.error("Failed to add stock:", error);
    } finally {
      setSubmitting(false);
    }
  };
const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  try {
    await api.delete(`/product/${id}`)
    toast.success("Product deleted successfully");
    fetchAll(); // refresh inventory list
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete product");
  }
};
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['xlsx', 'xls', 'csv'];
      const extension = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        toast.error("Please upload a valid Excel file (.xlsx, .xls, .csv)");
        return;
      }
      setExcelFile(file);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      setExcelUploading(true);
      const formDataObj = new FormData();
      formDataObj.append('file', excelFile);

      const success = await addStockFromExcel(formDataObj);
      if (success) {
        setOpenExcelModal(false);
        setExcelFile(null);
      }
    } catch (error) {
      console.error("Excel upload error:", error);
    } finally {
      setExcelUploading(false);
    }
  };

  const getStatusInfo = (item) => {
    if (item.quantity <= 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-700" };
    } else if (item.quantity <= (item.lowStockThreshold || 10)) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700" };
    }
    return { label: "In Stock", color: "bg-green-100 text-green-700" };
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
   return `https://project2-0tm8.onrender.com${imgPath}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">
          Inventory Management
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat title="Total Products" value={stats.totalProducts} />
          <Stat title="Low Stock Items" value={stats.lowStockItems} />
          <Stat title="Out of Stock" value={stats.outOfStock} />
          <Stat title="In Stock" value={stats.inStock} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-500 text-sm">
            Inventory List ({inventory.length} items)
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpenExcelModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileSpreadsheet size={18} />
              Upload Excel
            </button>
            <button
              onClick={() => setOpenModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add Stock
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No inventory items found. Add stock to get started.
                  </td>
                </tr>
              ) : (
                inventory.map((item, i) => {
                  const statusInfo = getStatusInfo(item);
                  return (
                    <tr key={i} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img 
                              src={getImageUrl(item.productImage)} 
                              alt={item.productName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{item.productName}</span>
                        </div>
                      </td>
                      <td>{item.productCategory || "Uncategorized"}</td>
                      <td className="font-medium">{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Stock Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Add Stock
            </h3>

            <form onSubmit={handleAddStock} className="space-y-3">
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ₹{product.price}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full border rounded-lg p-2"
                min="1"
                required
              />
            </form>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddStock}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {openExcelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[450px] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileSpreadsheet className="text-blue-600" />
              Upload Excel Sheet
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload an Excel file with columns: productId, quantity
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelFileChange}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100"
                >
                  {excelFile ? excelFile.name : "Choose File"}
                </label>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-gray-700 mb-2">Excel Format:</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-1">productId</th>
                      <th className="pb-1">quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>product_id_1</td>
                      <td>50</td>
                    </tr>
                    <tr>
                      <td>product_id_2</td>
                      <td>100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setOpenExcelModal(false); setExcelFile(null); }}
                className="px-4 py-2 border rounded-lg"
                disabled={excelUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleExcelUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                disabled={excelUploading}
              >
                {excelUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
