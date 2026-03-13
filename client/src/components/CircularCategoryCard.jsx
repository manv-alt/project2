import { useNavigate } from "react-router-dom";

const CircularCategoryCard = ({ category }) => {
  const navigate = useNavigate();
  
  // Default placeholder image if no category image
  const defaultImage = "/img2.png";

  const handleCategoryClick = () => {
    // Navigate to products page with category slug
    const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products?category=${categorySlug}`);
  };

  // Get image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return defaultImage;
    if (imgPath.startsWith('http')) return imgPath;
    return `https://project2-0tm8.onrender.com${imgPath}`;
  };

  return (
    <div 
      onClick={handleCategoryClick}
      className="group flex flex-col items-center cursor-pointer"
    >
      {/* Circular Image Container */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-green-50 flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300 shadow-md group-hover:shadow-xl border-2 border-green-100 group-hover:border-green-300">
        <img
          src={getImageUrl(category.image)}
          alt={category.name}
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-full"
          onError={(e) => { e.target.src = defaultImage; }}
        />
      </div>
      
      {/* Category Name */}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-green-600 text-center transition-colors duration-300 line-clamp-2 max-w-28 sm:max-w-32">
        {category.name}
      </h3>
    </div>
  );
};

export default CircularCategoryCard;

