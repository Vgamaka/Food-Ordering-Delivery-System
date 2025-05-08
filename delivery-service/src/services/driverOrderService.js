const axios = require("axios");

// Get service URLs from environment variables with proper fallbacks
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3003/api/orders";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001/api/auth";

/**
 * Fetch orders for a specific driver
 * Uses the getAllOrders endpoint and filters on the server side
 * @param {string} driverId - The ID of the driver
 * @returns {Promise<Array>} - Array of orders assigned to the driver or available for pickup
 */
exports.fetchOrdersByDriver = async (driverId) => {
  try {
    console.log(`🔍 Fetching orders for driver: ${driverId}`);
    console.log(`🔗 Making request to: ${ORDER_SERVICE_URL}/all`);
    
    // Get all orders from the order service
    const response = await axios.get(`${ORDER_SERVICE_URL}/all`);
    console.log(`✅ Successfully fetched all orders from order service`);
    
    // Filter orders for this driver (assigned orders + ready orders)
    const driverOrders = response.data.filter(order => 
      order.assignedDriverId === driverId || 
      (order.orderStatus === 'ready' && !order.assignedDriverId)
    );
    
    console.log(`📊 Found ${driverOrders.length} relevant orders for driver ${driverId}`);
    return driverOrders;
  } catch (error) {
    console.error(`❌ Failed to fetch driver orders: ${error.message}`);
    if (error.response) {
      console.error(`📝 Status: ${error.response.status}`);
      console.error(`📝 Data:`, error.response.data);
    }
    throw new Error(`Failed to fetch orders for driver: ${error.message}`);
  }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The ID of the order
 * @returns {Promise<Object>} - Order details
 */
exports.getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/details/${orderId}`);
    console.log(`✅ Successfully fetched details for order: ${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch order details: ${error.message}`);
    throw new Error(`Failed to fetch order details`);
  }
};

/**
 * Assign a driver to an order
 * @param {string} orderId - The ID of the order
 * @param {string} driverId - The ID of the driver
 * @returns {Promise<Object>} - Updated order
 */
exports.assignOrderToDriver = async (orderId, driverId) => {
  try {
    console.log(`🔄 Assigning driver ${driverId} to order ${orderId}`);
    
    // Use the updateOrderStatus endpoint in order-service
    // Set status directly to "onTheWay" when driver accepts the order
    const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
      assignedDriverId: driverId,
      orderStatus: "onTheWay" // Changed from "accepted" to "onTheWay"
    });
    
    console.log(`✅ Driver ${driverId} successfully assigned to order ${orderId}`);
    return response.data.order;
  } catch (error) {
    console.error(`❌ Failed to assign driver to order: ${error.message}`);
    throw new Error(`Failed to assign driver to order`);
  }
};

/**
 * Update the status of an order
 * @param {string} orderId - The ID of the order
 * @param {string} newStatus - The new status (onTheWay, delivered)
 * @param {string} driverId - The ID of the driver
 * @returns {Promise<Object>} - Updated order
 */
exports.updateOrderStatus = async (orderId, newStatus, driverId) => {
  try {
    console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
    
    // Validate status for driver updates
    if (!["onTheWay", "delivered"].includes(newStatus)) {
      throw new Error(`Invalid order status for driver: ${newStatus}`);
    }

    const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
      orderStatus: newStatus,
      assignedDriverId: driverId // Include for verification
    });
    
    console.log(`✅ Successfully updated order ${orderId} status to ${newStatus}`);
    return response.data.order;
  } catch (error) {
    console.error(`❌ Failed to update order status: ${error.message}`);
    throw new Error(`Failed to update order status to ${newStatus}`);
  }
};

/**
 * Get customer details for an order
 * @param {string} customerId - The ID of the customer
 * @returns {Promise<Object>} - Customer details including contact info
 */
exports.getCustomerDetails = async (customerId) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch customer details: ${error.message}`);
    throw new Error("Failed to fetch customer details");
  }
};

/**
 * Complete a delivery and handle payment if needed
 * @param {string} orderId - The ID of the order
 * @param {string} driverId - The ID of the driver
 * @returns {Promise<Object>} - Updated order
 */
exports.completeDelivery = async (orderId, driverId) => {
  try {
    console.log(`🔄 Completing delivery for order ${orderId}`);
    
    // First mark order as delivered
    const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
      orderStatus: "delivered",
      assignedDriverId: driverId
    });
    
    // If payment method is COD, update payment status
    if (response.data.order.paymentMethod === "cod") {
      console.log(`💰 Processing COD payment for order ${orderId}`);
      await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
        orderStatus: "delivered", // Include orderStatus parameter to satisfy the controller validation
        paymentStatus: "paid",
        assignedDriverId: driverId
      });
    }
    
    console.log(`✅ Delivery successfully completed for order ${orderId}`);
    return response.data.order;
  } catch (error) {
    console.error(`❌ Failed to complete delivery: ${error.message}`);
    throw new Error("Failed to complete delivery process");
  }
};

/**
 * Get delivery history for a driver
 * @param {string} driverId - The ID of the driver
 * @param {Object} filters - Optional filters (date range, status)
 * @returns {Promise<Array>} - Array of past deliveries
 */
exports.getDriverDeliveryHistory = async (driverId, filters = {}) => {
  try {
    // Fetch all orders and filter for completed ones by this driver
    const response = await axios.get(`${ORDER_SERVICE_URL}/all`);
    
    const completedOrders = response.data.filter(order => 
      order.assignedDriverId === driverId && 
      ["delivered", "cancelled"].includes(order.orderStatus)
    );
    
    // Apply date filters if provided
    let filteredOrders = completedOrders;
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.updatedAt) >= startDate
      );
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.updatedAt) <= endDate
      );
    }
    
    return filteredOrders;
  } catch (error) {
    console.error(`❌ Failed to fetch delivery history: ${error.message}`);
    throw new Error("Failed to fetch delivery history");
  }
};