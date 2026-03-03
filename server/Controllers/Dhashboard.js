import OrderModel from "../Models/Order.js";
import Product from "../Models/Product.js";
import UserModel from "../Models/Registermodel.js";




const Dhashboard = async(req, res) => {
    try {
        const totalUsers = await UserModel.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await OrderModel.countDocuments();
    const revenue = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: revenue[0]?.totalRevenue || 0,
    });
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}
export default Dhashboard;