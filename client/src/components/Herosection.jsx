import { Button } from "@/components/ui/button";
import { ShoppingCart, Boxes } from "lucide-react";

const Herosection = () => {
  return (
    <section className="bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Fresh Groceries <br />
            Delivered to Your <span className="text-green-600">Doorstep</span> 🥬
          </h1>

          <p className="text-lg text-gray-600 max-w-xl">
            Fruits, vegetables, dairy & essentials —  
            <span className="font-medium text-gray-800">
              {" "}daily fresh, always affordable.
            </span>
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shop Now
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-8"
            >
              <Boxes className="mr-2 h-5 w-5" />
              View Categories
            </Button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">
          <img
            src="/image.png" // put image in public folder
            alt="Fresh grocery basket"
            className="rounded-3xl shadow-2xl w-full max-w-lg hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
};

export default Herosection;
