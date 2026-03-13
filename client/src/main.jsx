import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DhashboardProvider } from './context/Dhasboardcontext'
import { ProductProvider } from './context/ProductContext'
import { CartProvider } from './context/CartContext'
import { CategoryProvider } from './context/CategoryContext'
import { InventoryProvider } from './context/InventoryContext'
import { OrderProvider } from './context/OrderContext'
import { PaymentProvider } from './context/PaymentContext'
import { AdminAuthProvider } from './context/AdminAuthContext'

createRoot(document.getElementById('root')).render(
   
    <BrowserRouter>
      <AuthProvider>
        <DhashboardProvider>
          <ProductProvider>
            <CartProvider>
              <CategoryProvider>
                <InventoryProvider>
                  <OrderProvider>
                    <PaymentProvider>
                      <AdminAuthProvider>
                      <App />
                      </AdminAuthProvider>
                    </PaymentProvider>
                  </OrderProvider>
                </InventoryProvider>
              </CategoryProvider>
            </CartProvider>
          </ProductProvider>
        </DhashboardProvider>
      </AuthProvider>
    </BrowserRouter>
 
)
