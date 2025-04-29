// frontend/src/services/api.js

import axios from "axios";

export const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

export const restaurantAPI = axios.create({
  baseURL: import.meta.env.VITE_RESTAURANT_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

export const orderAPI = axios.create({
  baseURL: import.meta.env.VITE_ORDER_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

export const driverAPI = axios.create({
  baseURL: import.meta.env.VITE_DRIVER_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});
