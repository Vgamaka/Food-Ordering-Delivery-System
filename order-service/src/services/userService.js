const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001/api/auth";

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user from auth-service:", error.message);
    throw new Error("Failed to fetch user from auth-service");
  }
};

module.exports = { getUserById };
