import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductPage from "./pages/ProductPage";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Addresses from "./pages/Addresses";
import MyOrders from "./pages/MyOrders";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import { Toaster } from "@/components/ui/sonner";
import VerifyOtp from "./components/Verifyotp";
import AdminDashboard from "./admin/pages/AdminDashboard";
import Adminlayouts from "./admin/Layouts/Adminlayouts";
import Products from "./admin/pages/Products";
import Categories from "./admin/pages/Categories";
import Orders from "./admin/pages/Order";
import Inventory from "./admin/pages/Inventory";
import AdminSettings from "./admin/pages/AdminSettings";
import Footer from "./components/footer";
import Cart from "./components/Cart";
import { AuthProvider } from "./context/AuthContext";
import { DhashboardProvider } from "./context/Dhasboardcontext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { CartProvider } from "./context/CartContext";
import AdminLoginModal from "./admin/components/AdminLoginModal";

const App = () => {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <ProductProvider>
          <CategoryProvider>
            <CartProvider>
              <DhashboardProvider>
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

                  {/* Products page with optional category param for query string */}
                  <Route path="/products" element={<>
                    <Navbar />
                    <ProductPage />
                    <Footer/>
                  </>  }/>

                  {/* Products page with route param (optional) */}
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

                  {/* FEEDBACK PAGE - New Route */}
                  <Route path="/feedback" element={<>
                    <Navbar />
                    <Feedback />
                    <Footer/>
                  </>  }/>

                  {/* STRIPE PAYMENT PAGES */}
                  <Route path="/success" element={
                    <><Navbar /><Success /><Footer /></>
                  } />
                  <Route path="/cancel" element={
                    <><Navbar /><Cancel /><Footer /></>
                  } />


                  {/* ADMIN PANEL */}
                   <Route path="/adminlogin" element={<AdminLoginModal/>} />

                  <Route path="/admin" element={<Adminlayouts/>}>
                    <Route index element={<AdminDashboard/>} />
                    <Route path="dashboard" element={<AdminDashboard/>} />
                    <Route path="Product" element={<Products/>}/>
                    <Route path="Categories" element={<Categories/>}/>
                    <Route path="order" element={<Orders/>}/>
                    <Route path="inventory" element={<Inventory/>}/>
                    <Route path="settings" element={<AdminSettings/>}/>
                  </Route>
                </Routes>

                <Toaster position="top-center" richColors />
              </DhashboardProvider>
            </CartProvider>
          </CategoryProvider>
        </ProductProvider>
      </AuthProvider>
    </AdminAuthProvider>
  );
};

export default App;

