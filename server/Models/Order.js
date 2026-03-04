
import moongoose from "mongoose";
const OrderSchema = new moongoose.Schema({
   user:{
        type: moongoose.Schema.Types.ObjectId,
    ref:'User'
   },
   items: [
    {
      productId: {
        type: moongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
      quantity: Number,
      price: Number,
    },
  ],
   totalAmount: Number,
  status: {
    type: String,
     enum: ["confirmed","pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
paymentMethod: {
    type: String,
    enum: ["stripe", "cod"],
    default: "cod",
},
paymentIntentId:{
    type: String,
},
shippingAddress: {
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
},


}, {
  timestamps: true,
})
const OrderModel = moongoose.model('Order', OrderSchema);
export default OrderModel;
