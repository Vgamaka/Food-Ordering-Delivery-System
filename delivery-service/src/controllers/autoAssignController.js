const Driver = require('../models/Driver');
const axios = require('axios');

// Configuration for the auto-assignment service
const AUTO_ASSIGN_CONFIG = {
  MAX_DISTANCE_KM: 5000,  // Maximum distance in kilometers to consider a driver
  DRIVER_RESPONSE_TIMEOUT: 60000, // Time in ms (1 minute) for driver to respond
  ORDER_SERVICE_URL: 'http://localhost:3003/api/orders',
  NOTIFICATION_SERVICE_URL: 'http://localhost:3005/api/notifications'
};


//   Automatically assigns ready orders to available drivers
exports.processReadyOrders = async () => {
  try {
    console.log('🔄 Processing ready orders for automatic assignment...');
    
    // 1. Fetch all orders with "ready" status and no assigned driver
    const response = await axios.get(`${AUTO_ASSIGN_CONFIG.ORDER_SERVICE_URL}/all`);
    const orders = response.data;
    const readyOrders = orders.filter(order => 
      order.orderStatus === 'ready' && 
      (!order.assignedDriverId || order.assignedDriverId === null)
    );
    
    if (readyOrders.length === 0) {
      console.log('No ready orders waiting for assignment');
      return;
    }
    
    console.log(`Found ${readyOrders.length} ready orders waiting for driver assignment`);
    
    // 2. Find all available drivers
    const availableDrivers = await Driver.find({ availability: true });
    
    if (availableDrivers.length === 0) {
      console.log('No available drivers at the moment');
      return;
    }
    
    console.log(`Found ${availableDrivers.length} available drivers for assignment`);
    
    // 3. Process each ready order
    for (const order of readyOrders) {
      await assignDriverToOrder(order, availableDrivers);
    }
    
  } catch (error) {
    console.error('Error in auto-assignment process:', error.message);
  }
};

/**
 * Assigns the best available driver to an order based on proximity and driver rating
 */
const assignDriverToOrder = async (order, availableDrivers) => {
  try {
    console.log(`🔍 Finding best driver for order #${order._id.slice(-6)}`);
    
    if (!order.restaurantLocation || !order.restaurantLocation.coordinates) {
      console.log(`Order #${order._id.slice(-6)} has no restaurant location coordinates. Skipping.`);
      return;
    }
    
    // 1. Calculate distance between restaurant and each driver
    const driversWithDistance = [];
    const restaurantCoords = {
      lat: order.restaurantLocation.coordinates[1],
      lng: order.restaurantLocation.coordinates[0]
    };
    
    for (const driver of availableDrivers) {
      if (!driver.currentLocation) continue;
      
      const distance = calculateDistance(
        restaurantCoords.lat, 
        restaurantCoords.lng,
        driver.currentLocation.lat,
        driver.currentLocation.lng
      );
      
      // Only consider drivers within the maximum distance
      if (distance <= AUTO_ASSIGN_CONFIG.MAX_DISTANCE_KM) {
        driversWithDistance.push({
          driver,
          distance
        });
      }
    }
    
    if (driversWithDistance.length === 0) {
      console.log(`No drivers within ${AUTO_ASSIGN_CONFIG.MAX_DISTANCE_KM}km of restaurant for order #${order._id.slice(-6)}`);
      return;
    }
    
    // 2. Sort drivers by distance (closest first)
    driversWithDistance.sort((a, b) => a.distance - b.distance);
    
    // 3. Assign to the closest driver
    const closestDriver = driversWithDistance[0].driver;
    
    // 4. Update the order with the assigned driver
    await axios.patch(`${AUTO_ASSIGN_CONFIG.ORDER_SERVICE_URL}/${order._id}/update-status`, {
      assignedDriverId: closestDriver._id,
      orderStatus: "onTheWay",
    });
    
    console.log(`✅ Order #${order._id.slice(-6)} automatically assigned to driver ${closestDriver.name}`);
    
    // 5. Send notification to driver
    await sendNotificationToDriver(closestDriver._id, order);
    
    // 6. Send notification to customer about driver assignment
    await notifyCustomerAboutDriver(order.customerId, closestDriver, order._id);
    
  } catch (error) {
    console.error(`Error assigning driver to order #${order._id.slice(-6)}:`, error.message);
  }
};

/**
 * Calculate the distance between two coordinates using the Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Send push notification to driver about new order assignment
 */
const sendNotificationToDriver = async (driverId, order) => {
  try {
    await axios.post(`${AUTO_ASSIGN_CONFIG.NOTIFICATION_SERVICE_URL}/send`, {
      userId: driverId,
      userType: 'driver',
      title: 'New Order Assigned',
      message: `Order #${order._id.slice(-6)} has been automatically assigned to you.`,
      data: {
        orderId: order._id,
        restaurantName: order.restaurantName,
        restaurantAddress: order.restaurantAddress
      }
    });
    console.log(`📱 Notification sent to driver ${driverId} about order #${order._id.slice(-6)}`);
  } catch (error) {
    console.error('Error sending notification to driver:', error.message);
  }
};

/**
 * Notify customer about driver assignment
 */
const notifyCustomerAboutDriver = async (customerId, driver, orderId) => {
  try {
    await axios.post(`${AUTO_ASSIGN_CONFIG.NOTIFICATION_SERVICE_URL}/send`, {
      userId: customerId,
      userType: 'customer',
      title: 'Driver Assigned to Your Order',
      message: `${driver.name} will deliver your order. You can track your delivery in real-time.`,
      data: {
        orderId,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicleNumber: driver.vehicleNumber
      }
    });
    console.log(`📱 Notification sent to customer about driver assignment for order #${orderId.slice(-6)}`);
  } catch (error) {
    console.error('Error sending notification to customer:', error.message);
  }
};