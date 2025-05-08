const bcrypt = require('bcrypt');
const Driver = require('../models/Driver');
const path = require('path');
const driverOrderService = require('../services/driverOrderService');

/* -------------------- DRIVER AUTHENTICATION -------------------- */

// Register a new driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, email, phone, vehicleNumber, password } = req.body;
    const licensePhoto = req.file ? req.file.filename : '';

    const existing = await Driver.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Driver already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = new Driver({
      name,
      email,
      phone,
      vehicleNumber,
      password: hashedPassword,
      availability: true,
      licensePhoto,
    });

    await newDriver.save();
    res.status(201).json({ message: 'Driver registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Login driver
exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      driverId: driver._id,
      name: driver.name,
      availability: driver.availability,
      licensePhoto: driver.licensePhoto,
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* -------------------- DRIVER PROFILE MANAGEMENT -------------------- */

// Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId).select('-password');

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    console.error('Profile Fetch Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update driver profile
exports.updateDriverProfile = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { name, email, phone, vehicleNumber } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { name, email, phone, vehicleNumber },
      { new: true }
    );

    if (!updatedDriver) return res.status(404).json({ message: 'Driver not found' });

    res.json({ message: 'Driver profile updated successfully', driver: updatedDriver });
  } catch (err) {
    console.error('Profile Update Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update driver availability
exports.updateDriverAvailability = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { availability } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { availability },
      { new: true }
    );

    if (!updatedDriver) return res.status(404).json({ message: 'Driver not found' });

    res.json({ message: 'Availability updated', driver: updatedDriver });
  } catch (err) {
    console.error('Availability Update Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* -------------------- DRIVER ORDERS MANAGEMENT (USING SERVICE INTERFACE) -------------------- */

// Fetch Driver Orders
exports.getDriverOrders = async (req, res) => {
  const { driverId } = req.params;
  try {
    // First check if driver is available
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Use the service interface to fetch orders
    const allOrders = await driverOrderService.fetchOrdersByDriver(driverId);

    let filteredOrders;

    if (driver.availability) {
      // If driver is available, show ready orders and their assigned orders
      filteredOrders = allOrders.filter(order =>
        (order.orderStatus === 'ready' && (!order.assignedDriverId || order.assignedDriverId === null)) ||
        (order.assignedDriverId === driverId)
      );
    } else {
      // If driver is not available, only show their assigned orders
      filteredOrders = allOrders.filter(order => order.assignedDriverId === driverId);
    }

    res.json(filteredOrders);
  } catch (err) {
    console.error("Error fetching driver's orders:", err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Assign Driver to Order
exports.assignDriverToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { assignedDriverId } = req.body;

    // Check driver availability first
    const driver = await Driver.findById(assignedDriverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (!driver.availability) {
      return res.status(400).json({ message: 'You must set your availability to "Available" before accepting orders' });
    }

    // Use the service interface to assign driver to order
    const updatedOrder = await driverOrderService.assignOrderToDriver(orderId, assignedDriverId);

    res.status(200).json({
      success: true,
      message: "Order assigned successfully",
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error assigning driver:', err.message);
    res.status(500).json({ message: 'Failed to assign order to driver' });
  }
};

// Update Delivery Status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, assignedDriverId } = req.body;  // Changed from driverId to assignedDriverId

  try {
    // Validate driver ID
    if (!assignedDriverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }
    
    // Use the service interface to update the order status
    const updatedOrder = await driverOrderService.updateOrderStatus(orderId, orderStatus, assignedDriverId);
    
    // If order is delivered, handle payment for COD orders
    if (orderStatus === 'delivered') {
      await driverOrderService.completeDelivery(orderId, assignedDriverId);
    }
    
    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Setup multer configuration for reuse in routes
exports.getMulterStorage = () => {
  return {
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  };
};