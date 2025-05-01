const axios = require("axios");

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

exports.getOrdersByRestaurant = async (restaurantId) => {
  try {
    const url = `${ORDER_SERVICE_URL}/restaurant/${restaurantId}`;  // Correct dynamic URL
    console.log(" Correctly calling order-service at:", url);

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(" Failed to fetch orders from order-service:", error.message);
    throw new Error("Failed to fetch restaurant orders from order-service");
  }
};


//  Accept an order with prepTime
exports.acceptOrder = async (orderId, prepTime) => {
  const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
    orderStatus: "accepted",
    prepTime,
  });
  return response.data.order; 
};

//  Reject an order
exports.rejectOrder = async (orderId) => {
  const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
    orderStatus: "rejected",
  });
  return response.data.order; 
};

//  Cancel an order
exports.cancelOrder = async (orderId) => {
  const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
    orderStatus: "cancelled",
  });
  return response.data.order; 
};

