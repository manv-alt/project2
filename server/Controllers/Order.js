import asyncHandler from "../Middleware/Asynhandler.js";
import CartModel from "../Models/Cartmodal.js";
import OrderModel from "../Models/Order.js";
import { reduceStockService } from "./Inventory.js";


export const createorder =  async (req, res) => {
try {
    const userId=req.user.id;
    const { paymentMethod } = req.body;
    const cartItems=await CartModel.find({user:userId}).populate('productId');
    if(!cartItems.length){
        return res.status(400).json({message:"Cart is empty"});
    }   
    let totalAmount=0;
    const orderItems = cartItems.map(item => {
        if (!item.productId || typeof item.productId.price === 'undefined') {
            throw new Error(`Product details are missing for cart item with product ID: ${item.productId}`);
        }
        totalAmount += item.productId.price * item.quantity;
        return {
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
        };
    });

    // For COD, reduce stock immediately
    let orderStatus = "pending";
    if (paymentMethod === 'cod') {
        orderStatus = "confirmed";
        // Reduce stock for COD orders
        for (const item of orderItems) {
            try {
                await reduceStockService(item.productId, item.quantity);
            } catch (stockError) {
                console.error(`Stock reduction error for product ${item.productId}:`, stockError);
            }
        }
    }

    const order= await OrderModel.create({
        user: userId,
        items: orderItems,
        totalAmount,
        status: orderStatus,
        paymentMethod: paymentMethod || 'stripe',
    });    
       
    // Clear user's cart after creating order
    await CartModel.deleteMany({ user: userId });
    res.status(201).json(order);         
} catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ error: error.message });

}
}
 export const getorders = async (req, res) => {
try {
    const userId=req.user.id;
    const order = await OrderModel.find({user: userId}).populate("items.productId").sort({createdAt:-1});
    return res.json(order);
} catch (error) {
        res.status(500).json({ error: error.message });     
}
}
export const getallorders = async (req, res) => {
    try{
        const order = await OrderModel.find().populate("user", "name email").populate("items.productId").sort({createdAt:-1});
        return res.json(order);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}
export const updateorderstatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const allowedStatus = ["pending", "paid", "shipped", "delivered", "cancelled"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const order = await OrderModel.findByIdAndUpdate(orderId,
            {status},
            { new: true }
            
        )
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
        
    }
}
