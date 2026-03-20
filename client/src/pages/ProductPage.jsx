import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useProduct } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { useCategory } from "@/context/CategoryContext";
import { useAuth } from "@/context/AuthContext";

const ProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategorySlug = searchParams.get("category") || "all";
  const urlSearchQuery = searchParams.get("search") || "";

  const { products: allProducts, isLoading, error } = useProduct();
  const { addToCart: addToCartContext } = useCart();
  const { categories } = useCategory();
  const { user, setLoginRedirect } = useAuth();

  const [quantities, setQuantities] = useState({});
  const [cartMessage, setCartMessage] = useState("");
  
  // Filter states
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  // Get parent categories and subcategories
  const parentCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.filter(cat => !cat.parent);
  }, [categories]);

  const getSubcategories = (parentId) => {
    if (!categories || categories.length === 0) return [];
    return categories.filter(cat => cat.parent === parentId);
  };

  // Filter products based on category, search, and price
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    let result = [...allProducts];

    // Filter by category
    if (urlCategorySlug && urlCategorySlug !== "all") {
      result = result.filter(product => {
        if (product.category && typeof product.category === 'object') {
          const catSlug = product.category.slug?.toLowerCase();
          const catName = product.category.name?.toLowerCase();
          const urlSlug = urlCategorySlug?.toLowerCase();
          return catSlug === urlSlug || 
                 catName === urlSlug ||
                 catName?.replace(/\s+/g, '-') === urlSlug;
        }
        return product.category?.toLowerCase() === urlCategorySlug?.toLowerCase();
      });
    }

    // Filter by search query
    if (urlSearchQuery) {
      const searchLower = urlSearchQuery.toLowerCase();
      result = result.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by subcategory
    if (selectedSubcategory && selectedSubcategory !== "all") {
      result = result.filter(product => {
        if (product.category && typeof product.category === 'object') {
          return product.category._id === selectedSubcategory;
        }
        return false;
      });
    }

    return result;
  }, [allProducts, urlCategorySlug, urlSearchQuery, selectedSubcategory]);

  // Get selected category for display
  const selectedCategory = useMemo(() => {
    if (!categories || categories.length === 0 || urlCategorySlug === "all") return null;
    return categories.find(cat => 
      cat.slug?.toLowerCase() === urlCategorySlug?.toLowerCase() ||
      cat.name?.toLowerCase() === urlCategorySlug?.toLowerCase()
    );
  }, [categories, urlCategorySlug]);

  // Handle quantity change
  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  // Handle add to cart - requires login
  const handleAddToCart = (product) => {
    const qty = quantities[product._id] || 1;
    
    if (!user) {
      setLoginRedirect("addToCart", { productId: product._id, quantity: qty });
      return;
    }
    
    addToCartContext(product._id, qty);
    setCartMessage(`${product.name} added to cart!`);
    setTimeout(() => setCartMessage(""), 2000);
  };

  // Get product image
  const getProductImage = (img) => {
    if (!img) return "/image.png";
    if (img.startsWith('http')) return img;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${img}`;
  };

  // Get category display name
  const getCategoryDisplayName = (product) => {
    if (product.category && typeof product.category === 'object') {
      return product.category.name;
    }
    return product.category || 'Uncategorized';
  };

  // Handle category badge click
  const handleCategoryBadgeClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const catSlug = product.category?.slug || 
                   (product.category?.name ? product.category.name.toLowerCase().replace(/\s+/g, '-') : '');
    if (catSlug) {
      window.history.pushState({}, '', `/products?category=${catSlug}`);
      setQuantities({});
    }
  };

  if (isLoading || !categories) {
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
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 capitalize">
            {urlSearchQuery ? `Search: "${urlSearchQuery}"` : 
             urlCategorySlug === "all" || !selectedCategory ? "All Products" : 
             `Fresh ${selectedCategory.name}`}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {urlSearchQuery ? 
             `Found ${filteredProducts.length} products matching "${urlSearchQuery}"` :
             urlCategorySlug === "all" || !selectedCategory
              ? "Browse our complete selection of fresh products" 
              : `Discover our premium selection of fresh ${selectedCategory.name.toLowerCase()}`}
          </p>
        </div>

        {/* Filter & Category Pills Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
            <Link
              to="/products?category=all"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                urlCategorySlug === "all" || !urlCategorySlug
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-green-50 border"
              }`}
            >
              All
            </Link>
            {parentCategories.map((cat) => {
              const subcategories = getSubcategories(cat._id);
              const hasSubcategories = subcategories.length > 0;
              
              return (
                <div key={cat._id} className="relative group">
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm inline-flex items-center gap-1 ${
                      urlCategorySlug === cat.slug
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-green-50 border"
                    }`}
                  >
                    {cat.name}
                    {hasSubcategories && (
                      <span className="ml-1 text-xs">▼</span>
                    )}
                  </Link>
                  
                  {/* Subcategories dropdown */}
                  {hasSubcategories && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <ul className="py-2">
                        <li>
                          <Link
                            to={`/products?category=${cat.slug}`}
                            className="block px-4 py-2 hover:bg-green-50 text-gray-700 font-medium text-sm"
                            onClick={() => setSelectedSubcategory("all")}
                          >
                            All {cat.name}
                          </Link>
                        </li>
                        {subcategories.map((sub) => (
                          <li key={sub._id}>
                            <Link
                              to={`/products?category=${sub.slug}`}
                              className="block px-4 py-2 hover:bg-green-50 text-gray-700 text-sm"
                              onClick={(e) => {
                                setSelectedSubcategory(sub._id);
                              }}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={getProductImage(product.img)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = "/image.png"; }}
                  />
                  {/* Stock Badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    product.availabilityStatus === "outOfStock"
                      ? "bg-red-100 text-red-700"
                      : product.availabilityStatus === "lowStock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {product.availabilityStatus === "outOfStock" ? "Out of Stock" :
                     product.availabilityStatus === "lowStock" ? "Low Stock" : "In Stock"}
                  </div>
                  {/* Category Badge */}
                  <button
                    onClick={(e) => handleCategoryBadgeClick(e, product)}
                    className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold hover:bg-blue-600 transition-colors"
                  >
                    {getCategoryDisplayName(product)}
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">per {product.unit}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Best Price
                    </div>
                  </div>

                  {/* Quantity Selector & Add to Cart */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden flex-1">
                      <button
                        onClick={() => handleQuantityChange(product._id, -1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={product.availabilityStatus === "outOfStock"}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="px-3 font-bold text-base min-w-[40px] text-center">
                        {quantities[product._id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product._id, 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={product.availabilityStatus === "outOfStock"}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                      disabled={product.availabilityStatus === "outOfStock"}
                    >
                      <ShoppingCart size={18} />
                      <span className="text-sm font-medium">Add</span>
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
            <p className="text-gray-500 text-lg mb-6">Try adjusting your filters or search terms</p>
            <Link
              to="/products?category=all"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}

        {/* Results Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-gray-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {selectedCategory && ` in ${selectedCategory.name}`}
              {urlSearchQuery && ` matching "${urlSearchQuery}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;

