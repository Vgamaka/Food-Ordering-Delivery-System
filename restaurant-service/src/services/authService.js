// === restaurant-service/src/services/authService.js ===
const axios = require("axios");

const AUTH_SERVICE_BASE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001/api/auth";

exports.getUserById = async (userId) => {
  const response = await axios.get(`${AUTH_SERVICE_BASE_URL}/users/${userId}`);
  return response.data;
};

// New: proxy update user
exports.updateUser = async (userId, payload) => {
  const response = await axios.put(
    `${AUTH_SERVICE_BASE_URL}/users/${userId}`,
    payload
  );
  return response.data;
};

// New: proxy delete user
exports.deleteUser = async (userId) => {
  const response = await axios.delete(
    `${AUTH_SERVICE_BASE_URL}/users/${userId}`
  );
  return response.data;
};