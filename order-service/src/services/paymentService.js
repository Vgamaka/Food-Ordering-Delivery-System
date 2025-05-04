const axios = require("axios");

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3005";

const requestPayHereHash = async (orderId, amount) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/api/payment/hash`, {
      orderId,
      amount,
    });
    return response.data.hash;
  } catch (err) {
    console.error("❌ Failed to get hash from payment-service:", err.message);
    throw err;
  }
};

module.exports = { requestPayHereHash };
