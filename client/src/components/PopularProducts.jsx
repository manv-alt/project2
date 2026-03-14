import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, setLoginRedirect } = useAuth();

  // Local state for quantity stepper (for packet products)
  const [quantities, setQuantities] = useState({});
  // Local state for weight selection (for weight products)
  const [selectedWeights, setSelectedWeights] = useState({});

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  const fetchRandomProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products/random?size=10");
      if (data.products) {
        setProducts(data.products);
        // Initialize quantities and weights
        const initialQuantities = {};
        const initialWeights = {};
        data.products.forEach(p => {
          initialQuantities[p._id] = 1;
          initialWeights[p._id] = p.unit || "500g";
        });
        setQuantities(initialQuantities);
        setSelectedWeights(initialWeights);
      }
    } catch (error) {
      console.log("Error fetching random products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/image.png";
    if (imgPath.startsWith('http')) return imgPath;
return `https://project2-oz9n.onrender.com${imgPath}`;
  };

  const handleProductClick = (product) => {
    // Navigate to products page with category filter
    if (product.category && product.category.slug) {
      navigate(`/products?category=${product.category.slug}`);
    } else {
      navigate("/products");
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      setLoginRedirect("addToCart", { productId: product._id, quantity: 1 });
      return;
    }

    let quantity = 1;
    
    if (product.productType === "weight") {
      // For weight products, quantity is based on selected weight
      const weight = selectedWeights[product._id] || "500g";
      // Parse weight to quantity (e.g., "500g" = 0.5kg = 1 unit)
      const weightNum = parseFloat(weight.replace('g', ''));
      quantity = weightNum / 500; // Normalize to 500g units
    } else {
      // For packet products, use the stepper quantity
      quantity = quantities[product._id] || 1;
    }

    try {
      await addToCart(product._id, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const incrementQuantity = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };

  const decrementQuantity = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const weightOptions = ["250g", "500g", "1kg", "2kg"];

  if (loading) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Popular Products
          </h2>
          <button 
            onClick={() => navigate("/products")}
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
          >
            View All →
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <div 
              key={product._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div 
                className="relative h-40 sm:h-48 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={getImageUrl(product.img)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = "/image.png"; }}
                />
                {/* Sale badge */}
                {product.availabilityStatus === "lowStock" && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-3 sm:p-4">
                <h3 
                  className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={() => handleProductClick(product)}
                >
                  {product.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-2">
                  {product.category?.name || "General"}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-green-600">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    / {product.unit}
                  </span>
                </div>

                {/* Weight Dropdown (for weight products) */}
                {product.productType === "weight" && (
                  <div className="mb-3">
                    <select
                      value={selectedWeights[product._id] || "500g"}
                      onChange={(e) => setSelectedWeights(prev => ({
                        ...prev,
                        [product._id]: e.target.value
                      }))}
                      className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {weightOptions.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity Stepper (for packet products) */}
                {product.productType === "packet" && (
                  <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => decrementQuantity(product._id)}
                      className="p-1.5 hover:bg-white rounded-md transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium">
                      {quantities[product._id] || 1}
                    </span>
                    <button
                      onClick={() => incrementQuantity(product._id)}
                      className="p-1.5 hover:bg-white rounded-md transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;

