
import moongoose from "mongoose";
const ProductSchema = new moongoose.Schema({
   
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
    type:String,
    required: true,
  },
   availabilityStatus: {
      type: String,
      enum: ["inStock", "lowStock", "outOfStock"],
      default: "inStock",
    },

  //   isActive: {
  //     type: Boolean,
  //     default: true,
  //   },


})
const Product = moongoose.model('Products', ProductSchema);
export default Product;