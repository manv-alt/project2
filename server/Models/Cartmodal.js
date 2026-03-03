
import moongoose from "mongoose";
const CartSchema = new moongoose.Schema({
    user:{
type: moongoose.Schema.Types.ObjectId,
ref:'User',
required: true,
    },
    productId: {
        type: moongoose.Schema.Types.ObjectId, // actual product reference
        ref:"Products", //refers to product model
        required: true,

    },
    quantity: {
        type: Number,
        default: 1,
    },



})
const CartModel = moongoose.model('Cart', CartSchema);
export default CartModel;
