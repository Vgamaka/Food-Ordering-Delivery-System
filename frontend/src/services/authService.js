// frontend/src/services/authService.js
import { authAPI } from "./api";

// Login (email/password)
export const login = (email, password) => {
  return authAPI.post("/login", { email, password }).then(res => res.data);
};

// Register Customer (JSON payload)
export const registerCustomer = (customerData) => {
  return authAPI.post("/register", { ...customerData, role: "customer" }).then(res => res.data);
};

// Register Delivery (multipart/form-data)
export const registerDelivery = (formData) => {
  return authAPI.post("/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

// Register Restaurant (multipart/form-data)
export const registerRestaurant = (formData) => {
  return authAPI.post("/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

// Google Login
export const googleLogin = (token) => {
  return authAPI.post("/google-login", { token }).then(res => res.data);
};
