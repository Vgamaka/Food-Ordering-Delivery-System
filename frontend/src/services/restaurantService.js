import { restaurantAPI, orderAPI, authAPI } from "./api";

// =====================================
//  Dashboard Services
// =====================================

export const fetchDashboardStats = (restaurantId) => {
  return restaurantAPI.get(`/dashboard/${restaurantId}`).then(res => res.data);
};

export const fetchChartData = (restaurantId, filter = "monthly") => {
  return restaurantAPI.get(`/dashboard/${restaurantId}/chart`, {
    params: { filter }
  }).then(res => res.data);
};


// =====================================
//  Profile Services
// =====================================

// fetch restaurant profile from restaurant-service
export const fetchProfile = (restaurantId) =>
  restaurantAPI
    .get(`/restaurants/${restaurantId}`)
    .then(res => res.data);

// updateProfile → restaurant-service
export const updateProfile = (restaurantId, profileData) =>
  restaurantAPI
    .put(`/restaurants/${restaurantId}/profile`, profileData)
    .then(res => res.data);


// deleteAccount → restaurant-service
export const deleteAccount = (restaurantId) =>
  restaurantAPI
    .delete(`/restaurants/${restaurantId}`)
    .then(res => res.data);

// =====================================
//  Menu Services
// =====================================

export const fetchMenuItems = (restaurantId) =>
  restaurantAPI.get(`/menu/restaurant/${restaurantId}`).then(res => res.data);


export const createMenuItem = (formData) => {
  return restaurantAPI.post(`/menu`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

export const editMenuItem = (menuItemId, formData) => {
  return restaurantAPI.put(`/menu/${menuItemId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

export const deleteMenuItem = (menuItemId) => {
  return restaurantAPI.delete(`/menu/${menuItemId}`).then(res => res.data);
};

// =====================================
// Order Services
// =====================================

export const fetchOrders = (restaurantId) =>
  orderAPI.get(`/restaurant/${restaurantId}`)
    .then(res => res.data);

// fetch single order details (fixed)
export const fetchOrderDetails = (orderId) =>
  orderAPI.get(`/details/${orderId}`)
    .then(res => res.data);

export const updateOrderStatus = (orderId, payload) =>
  orderAPI
    // <<— drop the `orders` prefix: PATCH /api/orders/:orderId/update-status
    .patch(`/${orderId}/update-status`, payload)
    .then(res => res.data);

export const fetchSingleMenuItem = async (menuItemId) => {
  const res = await restaurantAPI.get(`/menu/${menuItemId}`);
  return res.data;
};