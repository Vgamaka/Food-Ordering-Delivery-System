import { authAPI, restaurantAPI, orderAPI } from "./api";

// ============================================
// 📦 MENU & RESTAURANT SECTION
// ============================================

// Fetch all approved restaurants
export const fetchAllRestaurants = async () => {
  const res = await authAPI.get("/users", {
    params: { role: "restaurant", status: "approved" },
  });
  return res.data.users || res.data;
};

// Fetch a single restaurant details
export const fetchRestaurantById = async (restaurantId) => {
  const res = await authAPI.get(`/users/${restaurantId}`);
  return res.data;
};

// Fetch menu items of a specific restaurant
export const fetchMenuItemsByRestaurant = async (restaurantId) => {
  const res = await restaurantAPI.get(`/menu/${restaurantId}`);
  return res.data;
};

// Fetch all menu items (for Home page etc.)
export const fetchAllMenuItems = async () => {
  const res = await restaurantAPI.get(`/menu/list/all`);
  return res.data;
};

// ============================================
// 📦 CUSTOMER ORDERS SECTION
// ============================================

// Place a new order
export const placeOrder = async (orderData) => {
    const res = await orderAPI.post("/", orderData);
    return res.data;
  };
  

// Get all orders of a customer
export const fetchOrdersByCustomer = async (customerId) => {
  const res = await orderAPI.get(`/customer/${customerId}`);
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await orderAPI.patch(`/cancel/${orderId}`);
  return res.data;
};

// Update order after payment (PayHere success callback)
export const updateOrderStatusAfterPayment = async (orderId, updateData) => {
  const res = await orderAPI.patch(`/${orderId}/update-status`, updateData);
  return res.data;
};



// ============================================
// 📦 CUSTOMER PROFILE SECTION
// ============================================

// Update customer profile details
export const updateUserProfile = async (userId, updatedData) => {
  const res = await authAPI.put(`/users/${userId}`, updatedData);
  return res.data;
};
