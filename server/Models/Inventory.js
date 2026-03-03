
import moongoose from "mongoose";
const InventorySchema = new moongoose.Schema({
   productId:{
        type: moongoose.Schema.Types.ObjectId,
    ref:'Products'
   },
    quantity:{
        type:Number,
        required:true,
        min:0 
    },
lowStockThreshold:{
    type:Number,
    default:10},


})
const Inventorymodel = moongoose.model('Inventory', InventorySchema);
export default Inventorymodel;