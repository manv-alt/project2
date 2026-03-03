import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductPage from "./pages/ProductPage";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Addresses from "./pages/Addresses";
import MyOrders from "./pages/MyOrders";
import { Toaster } from "@/components/ui/sonner";
import VerifyOtp from "./components/Verifyotp";
import Dashboard from "./admin/pages/Dashboard";
import Adminlayouts from "./admin/Layouts/Adminlayouts";
import Products from "./admin/pages/products";
import Categories from "./admin/pages/Categories";
import Orders from "./admin/pages/Order";
import Inventory from "./admin/pages/Inventory";
import Footer from "./components/footer";
import Cart from "./components/Cart";


const App = () => {
   return (
      <>
         <Routes>
            {/* USER WEBSITE */}
            <Route path="/" element={<>
              <Navbar />
              <Home />
              <Footer/>
              </>  }/>

            <Route path="/about" element={<>
              <Navbar />
              <About />
              <Footer/>
              </>  }/>

            <Route path="/contact" element={<>
              <Navbar />
              <Contact />
              <Footer/>
              </>  }/>

            <Route path="/products/:category" element={<>
              <Navbar />
              <ProductPage />
              <Footer/>
              </>  }/>

            <Route path="/profile" element={<>
              <Navbar />
              <Profile />
              <Footer/>
              </>  }/>

            <Route path="/profile/edit" element={<>
              <Navbar />
              <EditProfile />
              <Footer/>
              </>  }/>

            <Route path="/addresses" element={<>
              <Navbar />
              <Addresses />
              <Footer/>
              </>  }/>
 
            <Route path="/my-orders" element={<>
              <Navbar />
              <MyOrders />
              <Footer/>
              </>  }/>
 
            <Route
               path="/VerifyOtp"
               element={
                  <>
                     <Navbar />
                     < VerifyOtp />
                  </>
               }
            />


            {/* ADMIN PANEL */}
            <Route path="/admin" element={<Adminlayouts/>}>
               <Route index element={<Dashboard/>} />
               <Route path="Product" element={<Products/>}/>
               <Route path="Categories" element={<Categories/>}/>
               <Route path="order" element={<Orders/>}/>
               <Route path="inventory" element={<Inventory/>}/>
            </Route>
         </Routes>

         <Toaster position="top-center" richColors />
      </>
   );
};

export default App;
