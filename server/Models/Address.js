import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  }
}, { timestamps: true });

const AddressModel = mongoose.model('Address', addressSchema);
export default AddressModel;
