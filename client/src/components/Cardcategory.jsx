import { useNavigate } from "react-router-dom";

const categories = [
  {
    title: "Fruits",
    image: "/img2.png",
    overlay: "bg-green-600",
  },
  {
    title: "Vegetables",
    image: "/img3.png",
    overlay: "bg-emerald-600",
  },
  {
    title: "Dairy",
    image: "/image.png",
    overlay: "bg-blue-600",
  },
  {
    title: "Bakery",
    image: "/img2.png",
    overlay: "bg-yellow-600",
  },
  {
    title: "Snacks",
    image: "/img3.png",
    overlay: "bg-pink-600",
  },
  {
    title: "Beverages",
    image: "/image.png",
    overlay: "bg-purple-600",
  },
];

const Cardcategory = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.title}`);
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shop by Category
          </h2>
          <p className="text-gray-600 mt-2">
            Fresh picks across all your daily needs
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(cat)}
              className="group relative bg-white rounded-2xl border hover:shadow-2xl cursor-pointer overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className={`absolute inset-0 ${cat.overlay} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
              </div>

              {/* Content */}
              <div className="p-4 text-center relative">
                <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300 transform group-hover:-translate-y-1">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop now →
                </p>
              </div>

              {/* Enhanced hover effect - decorative line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Cardcategory;
