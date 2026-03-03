import { AiOutlineClose } from "react-icons/ai";
import { BiMenu, BiSearch } from "react-icons/bi";
import { FiShoppingCart } from "react-icons/fi";
import { ChevronDown, Apple, Carrot, Milk, Candy, Coffee } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Loginmodal from "./loginmodal";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "@/context/authcontext";
import { Button } from "@/components/ui/button";
import Cart from "./Cart";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [cartOpen, setCartOpen] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const { cartItems } = useCart();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "contact", href: "/contact" },
  ];

  // Category icons mapping
  const categoryItems = [
    { name: "Fruits", icon: Apple, color: "text-green-600" },
    { name: "Vegetables", icon: Carrot, color: "text-emerald-600" },
    { name: "Dairy", icon: Milk, color: "text-blue-600" },
    { name: "Snacks", icon: Candy, color: "text-pink-600" },
    { name: "Beverages", icon: Coffee, color: "text-purple-600" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-green-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold">
              G
            </div>
            <span className="text-xl font-bold text-gray-900">
              Grocery<span className="text-green-600">Mart</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex  gap-8">

            {/* CATEGORY DROPDOWN */}
           

            {/* OTHER LINKS */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          
           <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-1 font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                Category
                <ChevronDown 
                  size={18} 
                  className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-10 left-0 w-56 bg-white rounded-xl shadow-xl border z-50 overflow-hidden animate-fadeInDown">
                  <ul className="py-2">
                    {categoryItems.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <li key={cat.name}>
                          <Link
                            to={`/products/${cat.name}`}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 hover:pl-5 transition-all duration-200 group"
                            onClick={() => setIsCategoryOpen(false)}
                          >
                            <Icon className={`w-5 h-5 ${cat.color} group-hover:scale-110 transition-transform duration-200`} />
                            <span className="text-gray-700 group-hover:text-green-600 font-medium transition-colors duration-200">
                              {cat.name}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
</div>
          {/* RIGHT SIDE */}
          <div className="flex items-center gap-5">

            {/* SEARCH */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-4 pr-10 py-2 w-56 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
              <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* CART */}
            <Button onClick={() => setCartOpen(true)} className="relative">
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
              className="lg:hidden text-gray-700"
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

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-md px-6 py-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block font-medium text-gray-700 hover:text-green-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;