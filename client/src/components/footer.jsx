import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
              G
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Grocery<span className="text-green-600">Mart</span>
            </h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Fresh groceries delivered daily. Quality you trust, prices you love.
          </p>

          {/* SOCIAL */}
          <div className="flex gap-4 mt-5">
            <Facebook className="w-5 h-5 text-gray-500 hover:text-green-600 cursor-pointer" />
            <Instagram className="w-5 h-5 text-gray-500 hover:text-green-600 cursor-pointer" />
            <Twitter className="w-5 h-5 text-gray-500 hover:text-green-600 cursor-pointer" />
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="/" className="hover:text-green-600">Home</a></li>
            <li><a href="/categories" className="hover:text-green-600">Categories</a></li>
            <li><a href="/deals" className="hover:text-green-600">Deals</a></li>
            <li><a href="/about" className="hover:text-green-600">About Us</a></li>
          </ul>
        </div>

        {/* CATEGORIES */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>Fruits & Vegetables</li>
            <li>Dairy & Bakery</li>
            <li>Snacks & Beverages</li>
            <li>Household Essentials</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              Mumbai, India
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              support@grocerymart.com
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} GroceryMart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
