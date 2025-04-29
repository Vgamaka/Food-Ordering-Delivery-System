const axios = require("axios");

const AUTH_SERVICE_BASE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001/api/auth";

exports.getUserById = async (userId) => {
  const response = await axios.get(`${AUTH_SERVICE_BASE_URL}/users/${userId}`);
  return response.data;
};
