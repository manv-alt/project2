import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  subcategories: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;
