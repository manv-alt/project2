import { AiOutlineClose } from "react-icons/ai";
import { BiMenu, BiSearch, BiX } from "react-icons/bi";
import { FiShoppingCart, FiUser } from "react-icons/fi";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loginmodal from "./Loginmodal";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Cart from "./Cart";
import { useCart } from "@/context/CartContext";
import api from "@/lib/axios";

const Navbar = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  const { user, setLoginRedirect } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Category", href: "/products" },
    { name: "Contact", href: "/contact" },
  ];

  // Debounced search function
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await api.get(`/products/search?q=${encodeURIComponent(query.trim())}`);
      if (data.products && data.products.length > 0) {
        setSearchResults(data.products);
        setShowSuggestions(true);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.log("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debounce
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setSearchQuery("");
    setSearchResults([]);
    // Navigate to products page with category filter if product has category
    if (product.category && product.category.slug) {
      navigate(`/products?category=${product.category.slug}`);
    } else {
      navigate(`/products`);
    }
  };

  // Handle Shop Now / shopping action - requires login
  const handleShopNow = () => {
    if (!user) {
      setLoginRedirect("shopNow");
    } else {
      navigate("/products");
    }
  };

  // Get image URL helper
  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
return `https://project2-0tm8.onrender.com${imgPath}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-green-600 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-lg">
              G
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Grocery<span className="text-green-600">Mart</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex gap-6 xl:gap-8">

            {/* NAV LINKS */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-5">

            {/* SEARCH - DESKTOP */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.length >= 2 && searchResults.length > 0 && setShowSuggestions(true)}
                  className="pl-4 pr-10 py-2 w-48 xl:w-56 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                  {isSearching ? (
                    <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />
                  ) : (
                    <BiSearch size={18} />
                  )}
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                  <ul>
                    {searchResults.map((product) => (
                      <li key={product._id}>
                        <button
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                        >
                          <img
                            src={getImageUrl(product.img) || "/image.png"}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{product.name}</p>
                            <p className="text-sm text-green-600 font-semibold">₹{product.price}/<span className="text-xs">{product.unit}</span></p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t px-4 py-2 bg-gray-50">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-sm text-green-600 font-medium hover:underline"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE SEARCH BUTTON */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden text-gray-700 p-2"
            >
              <BiSearch size={22} />
            </button>

            {/* CART */}
            <Button onClick={() => setCartOpen(true)} className="relative bg-green-600 hover:bg-green-700">
              <FiShoppingCart size={20} />
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartItems.length}
                </span>
              )}
            </Button>
            <Cart open={cartOpen} onOpenChange={setCartOpen} />

            {/* AUTH */}
            {user ? <ProfileMenu /> : <Loginmodal />}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 p-2"
            >
              {isMobileMenuOpen ? (
                <AiOutlineClose size={22} />
              ) : (
                <BiMenu size={22} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH OVERLAY */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 text-gray-700"
              >
                <BiX size={24} />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </form>
            </div>
            
            {/* Mobile Search Results */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="mt-4">
                <ul className="divide-y">
                  {searchResults.map((product) => (
                    <li key={product._id}>
                      <button
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full flex items-center gap-3 py-3 px-2 hover:bg-gray-50"
                      >
                        <img
                          src={getImageUrl(product.img) || "/image.png"}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-green-600 font-semibold">₹{product.price}/{product.unit}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-md">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile Nav Links */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block font-medium text-gray-700 hover:text-green-600 px-2 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Shop Now Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleShopNow();
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium mt-2"
            >
              Shop Now
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

