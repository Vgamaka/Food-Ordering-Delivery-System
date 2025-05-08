import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./Components/ScrollToTop"

// Contexts
import { useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Route Guards
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import CustomerProtectedRoute from "./routes/CustomerProtectedRoute"; //  NEW
import DriverProtectedRoute from "./routes/DriverProtectedRoute";
// Auth Pages
import Login from "./pages/auth/Login";
import RegisterCustomer from "./pages/auth/RegisterCustomer";
import RegisterRestaurant from "./pages/auth/RegisterRestaurant";
import RegisterDelivery from "./pages/auth/RegisterDelivery";

// Admin Pages
import AdminPanel from "./pages/admin/AdminPanel";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Restaurant Pages
import MenuList from "./pages/restaurant/menu/MenuList";
import { AddMenuItem }  from "./pages/restaurant/menu/AddMenuItem";
import { EditMenuItem } from "./pages/restaurant/menu/EditMenuItem";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import Profile from "./pages/restaurant/Profile";
import Dashboard from "./pages/restaurant/Dashboard";
import OrderList from "./pages/restaurant/orders/OrderList";
import OrderDetails from "./pages/restaurant/orders/OrderDetails";

// Customer Website Pages
import AllItems from "./pages/website/AllItems";
import AllRestaurants from "./pages/website/AllRestaurants";
import RestaurantMenu from "./pages/website/RestaurantMenu";
import Cart from "./pages/website/Cart";
import Checkout from "./pages/website/Checkout";
import CustomerOrders from "./pages/website/CustomerOrders";
import DeliveryTracking from "./pages/website/DeliveryTracking";
import CusProfile from "./pages/website/cusProfile";

// Delivery Driver Pages
import DriverRegister from "./pages/delivery/Register";
import DriverDashboard from "./pages/delivery/Dashboard";
import DriverLogin from "./pages/delivery/Login";
import DriverProfile from "./pages/delivery/Profile";
import DriverOrders from "./pages/delivery/DriverOrders";

// Payment Redirect
import PayHereRedirect from "./pages/website/PayHereRedirect";

// Unauthorized Page
import Unauthorized from "./pages/website/Unauthorized";

function App() {
  const { auth } = useAuth();
  const restaurantId = auth.user?.id; // Dynamic restaurant ID from logged-in user

  return (
    <Router>
      <CartProvider>
      <ScrollToTop />
        <Routes>
          {/* ================= Public Pages ================= */}
          <Route path="/" element={<AllItems />} />
          <Route path="/restaurants" element={<AllRestaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantMenu />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/restaurant" element={<RegisterRestaurant />} />
          <Route path="/register/delivery" element={<RegisterDelivery />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/pay" element={<PayHereRedirect />} />

          {/* ================= Customer Protected Pages ================= */}
          <Route path="/cart" element={
            <CustomerProtectedRoute>
              <Cart />
            </CustomerProtectedRoute>
          } />
          <Route path="/checkout" element={
            <CustomerProtectedRoute>
              <Checkout />
            </CustomerProtectedRoute>
          } />
          <Route path="/myorders" element={
            <CustomerProtectedRoute>
              <CustomerOrders />
            </CustomerProtectedRoute>
          } />
          <Route path="/profile" element={
            <CustomerProtectedRoute>
              <CusProfile />
            </CustomerProtectedRoute>
          } />
          <Route path="/trackorder" element={
            <CustomerProtectedRoute>
              <DeliveryTracking />
            </CustomerProtectedRoute>
          } />
          <Route path="/website/DeliveryTracking/:orderId" element={
            <CustomerProtectedRoute>
              <DeliveryTracking />
            </CustomerProtectedRoute>
          } />

          {/* ================= Admin Protected Pages ================= */}
          <Route path="/admin/approval" element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          } />

          {/* ================= Restaurant Protected Pages ================= */}
          <Route path="/restaurant/home" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <RestaurantDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/menu" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <MenuList restaurantId={restaurantId} />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/menu/add" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <AddMenuItem restaurantId={restaurantId} />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/menu/edit/:id" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <EditMenuItem restaurantId={restaurantId} />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/orders" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <OrderList restaurantId={restaurantId} />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/orders/:id" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <OrderDetails />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/resprofile" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <Profile restaurantId={restaurantId} />
            </RoleProtectedRoute>
          } />
          <Route path="/restaurant/dashboard" element={
            <RoleProtectedRoute allowedRoles={["restaurant"]}>
              <Dashboard restaurantId={restaurantId} />
            </RoleProtectedRoute>
          } />

          {/* ================= Driver Protected Pages ================= */}
          <Route path="/register/driver" element={<DriverRegister />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/dashboard" element={
            <DriverProtectedRoute allowedRoles={["delivery"]}>
              <DriverDashboard />
            </DriverProtectedRoute>
          } />
            <Route
              path="/driverProfile"
              element={
                <DriverProtectedRoute>
                  <DriverProfile />
                </DriverProtectedRoute>
              }
            />
          <Route path="/delivery/orders" element={
            <DriverProtectedRoute allowedRoles={["delivery"]}>
              <DriverOrders />
            </DriverProtectedRoute>
          } />

        </Routes>

        {/* Toasts */}
        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </Router>
  );
}

export default App;
