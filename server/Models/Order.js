
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
     enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
paymentIntentId:{
    type: String,
},


}, {
  timestamps: true,
})
const OrderModel = moongoose.model('Order', OrderSchema);
export default OrderModel;