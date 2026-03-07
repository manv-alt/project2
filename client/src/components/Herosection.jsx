import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Boxes } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Herosection = () => {
  const navigate = useNavigate();
  const { user, setLoginRedirect } = useAuth();

  const handleShopNow = () => {
    if (!user) {
      setLoginRedirect("shopNow");
    } else {
      navigate("/products");
    }
  };

  const handleViewCategories = () => {
    navigate("/products?category=all");
  };

  return (
    <section className="bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

        {/* LEFT CONTENT */}
        <div className="space-y-4 md:space-y-6 text-center lg:text-left order-2 lg:order-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Fresh Groceries <br />
            Delivered to Your <span className="text-green-600">Doorstep</span> 🥬
          </h1>

          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
            Fruits, vegetables, dairy & essentials —  
            <span className="font-medium text-gray-800">
              {" "}daily fresh, always affordable.
            </span>
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4 justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={handleShopNow}
              className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 shadow-lg text-sm md:text-base"
            >
              <ShoppingCart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Shop Now
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleViewCategories}
              className="border-green-600 text-green-600 hover:bg-green-50 px-6 md:px-8 text-sm md:text-base"
            >
              <Boxes className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              View Categories
            </Button>
          </div>

          {/* Trust Indicators */}
          {/* <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 pt-4 md:pt-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600">10K+</p>
              <p className="text-xs md:text-sm text-gray-500">Happy Customers</p>
            </div>
            <div className="w-px h-8 md:h-10 bg-gray-300 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600">500+</p>
              <p className="text-xs md:text-sm text-gray-500">Products</p>
            </div>
            <div className="w-px h-8 md:h-10 bg-gray-300 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600">24/7</p>
              <p className="text-xs md:text-sm text-gray-500">Delivery</p>
            </div>
          </div> */}
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center order-1 lg:order-2">
          <img
            src="/image.png"
            alt="Fresh grocery basket"
            className="rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-sm md:max-w-lg lg:max-w-xl hover:scale-[1.02] transition-transform duration-300"
          />
          
          {/* Floating badges */}
          <div className="absolute -bottom-4 -left-4 md:bottom-6 md:left-6 bg-white rounded-xl shadow-lg p-3 md:p-4 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl md:text-2xl">🥦</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">Fresh</p>
              <p className="font-bold text-green-600 text-sm md:text-base">Organic Veggies</p>
            </div>
          </div>
          
          <div className="absolute -top-4 -right-4 md:top-6 md:right-6 bg-white rounded-xl shadow-lg p-3 md:p-4 flex items-center gap-3" style={{ animation: 'bounce 2s infinite', animationDelay: '1s' }}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xl md:text-2xl">🍎</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500">100%</p>
              <p className="font-bold text-orange-500 text-sm md:text-base">Fresh Fruits</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Herosection;

