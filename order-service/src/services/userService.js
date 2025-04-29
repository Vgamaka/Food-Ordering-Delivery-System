const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user from auth-service");
  }
};

module.exports = { getUserById };
