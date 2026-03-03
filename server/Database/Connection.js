 import mongose  from "mongoose";
const connectdb =async()=>{
try {
    mongose.connect(process.env.MONGODB_URI)
    console.log("Database connected successfully");
    
} catch (error) {
    console.log("Database connection failed",error);
    
}
}
export default connectdb;