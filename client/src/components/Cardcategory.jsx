import { useCategory } from "@/context/CategoryContext";
import CircularCategoryCard from "./CircularCategoryCard";

const Cardcategory = () => {
  const { categories } = useCategory();

  // Get parent categories only (no parent - for subcategories)
  const parentCategories = categories.filter(cat => !cat.parent);

  // If no categories from database, show placeholder message
  const displayCategories = parentCategories.length > 0 ? parentCategories : [];

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            GROCERIES & FOOD
          </h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Fresh picks across all your daily needs
          </p>
        </div>

        {/* Circular Category Grid */}
        {displayCategories.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
            {displayCategories.map((cat) => (
              <CircularCategoryCard 
                key={cat._id} 
                category={cat} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories available. Please add categories from admin panel.</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Cardcategory;
