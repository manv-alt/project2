import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useProduct } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";

const ProductPage = () => {
  const { category } = useParams();
  const { products: allProducts, isLoading, error } = useProduct();
  const { addToCart: addToCartContext } = useCart();
  const [quantities, setQuantities] = useState({});
  const [cartMessage, setCartMessage] = useState("");

  // Filter products by category
  const categoryProducts = allProducts.filter(product =>
    product.category.toLowerCase() === category.toLowerCase()
  );

  useEffect(() => {
    // Reset quantities when category changes
    const initialQuantities = {};
    categoryProducts.forEach(p => {
      initialQuantities[p._id] = 1;
    });
    setQuantities(initialQuantities);
  }, [category, allProducts]);

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const addToCart = (product) => {
    const qty = quantities[product._id] || 1;
    addToCartContext(product._id, qty);
    setCartMessage(`${product.name} added to cart!`);
    setTimeout(() => setCartMessage(""), 2000);
  };

  // Get product image - handle both server path and local path
  const getProductImage = (img) => {
    if (!img) return "/image.png";
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-500 mb-2 text-lg">{error}</p>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Cart Success Message */}
      {cartMessage && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          {cartMessage}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 capitalize">
            Fresh {category}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our premium selection of fresh {category.toLowerCase()} delivered straight to your door
          </p>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categoryProducts.map((product, index) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={getProductImage(product.img)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = "/image.png"; }}
                  />
                  {/* Stock Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    product.availabilityStatus === "outOfStock"
                      ? "bg-red-100 text-red-700"
                      : product.availabilityStatus === "lowStock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {product.availabilityStatus === "outOfStock" ? "Out of Stock" :
                     product.availabilityStatus === "lowStock" ? "Low Stock" : "In Stock"}
                  </div>
                  {/* Fresh Badge */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Fresh
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">per {product.unit}</p>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Best Price
                    </div>
                  </div>

                  {/* Quantity Selector & Add to Cart */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(product._id, -1)}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        disabled={product.availabilityStatus === "outOfStock"}
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-4 font-bold text-lg min-w-[50px] text-center">
                        {quantities[product._id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product._id, 1)}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        disabled={product.availabilityStatus === "outOfStock"}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                      disabled={product.availabilityStatus === "outOfStock"}
                    >
                      <ShoppingCart size={20} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🛒</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No products found</h3>
            <p className="text-gray-500 text-lg">We're working on adding more fresh products to this category</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            Showing {categoryProducts.length} fresh products in {category}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
