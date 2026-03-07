
import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
   
 name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
    unit: {
      type: String,
      required: true,
    },
  img: {
    type: String,
    default: "",
  },
   category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  productType: {
    type: String,
    enum: ["weight", "packet"],
    default: "packet",
  },
   availabilityStatus: {
      type: String,
      enum: ["inStock", "lowStock", "outOfStock"],
      default: "inStock",
    },


})
const Product = mongoose.model('Products', ProductSchema);
export default Product;
