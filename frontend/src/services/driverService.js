// frontend/src/services/driverService.js
import { driverAPI } from "./api";

// =======================
// AUTH RELATED
// =======================

export const registerDriver = (formData) => {
  return driverAPI.post('/register', formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

export const loginDriver = (formData) => {
  return driverAPI.post('/login', formData).then(res => res.data);
};

// =======================
// DRIVER PROFILE RELATED
// =======================

export const fetchDriverProfile = (driverId) => {
  return driverAPI.get(`/profile/${driverId}`).then(res => res.data);
};

export const toggleDriverAvailability = (driverId, availability) => {
  return driverAPI.put(`/availability/${driverId}`, { availability }).then(res => res.data);
};

export const updateDriverProfile = (driverId, profileData) => {
  return driverAPI.put(`/profile/${driverId}`, profileData).then(res => res.data);
};

// =======================
// ORDERS RELATED
// =======================

// ✅ Fetch Driver Orders
export const fetchOrdersByDriver = (driverId) => {
  return driverAPI.get(`/orders/driver/${driverId}`).then(res => res.data);
};

// ✅ Assign Driver to Order
export const assignOrderToDriver = (orderId, driverId) => {
  return driverAPI.post(`/orders/assign/${orderId}`, { assignedDriverId: driverId }).then(res => res.data);
};

// ✅ Update Order Delivery Status (onTheWay → delivered)
export const updateOrderStatus = (orderId, newStatus) => {
  // Get driver ID from localStorage to include in the request
  const driverId = localStorage.getItem('driverId');
  
  return driverAPI.put(`/orders/${orderId}/status`, { 
    orderStatus: newStatus,
    assignedDriverId: driverId // Changed from "driverId" to "assignedDriverId" to match backend expectation
  }).then(res => res.data);
};
