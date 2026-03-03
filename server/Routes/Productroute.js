 import express from "express"; 
 import upload from "../Middleware/Upploads.js";
 import {addproduct, deleteProduct, getProducts, updateproduct}from"../Controllers/Product.js"
   const router = express.Router();


 router.post("/product",upload.single("image"), addproduct)
 router.get("/product", getProducts);
router.put("/product/:id", upload.single("image"), updateproduct);
router.delete("/product/:id", deleteProduct);
 export default router;
