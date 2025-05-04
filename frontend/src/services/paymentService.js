// src/services/paymentService.js
import axios from "axios";

const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://localhost:3005";

export const requestPayHereHash = async (orderId, amount) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/api/payment/hash`, {
      orderId,
      amount,
    });
    return response.data; // returns { hash: "..." }
  } catch (err) {
    console.error("❌ Failed to get hash from payment-service:", err.message);
    throw err;
  }
};
