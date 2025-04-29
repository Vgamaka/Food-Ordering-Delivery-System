const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const multer = require('multer');
const path = require('path');
const axios = require('axios');

// Environment variables
const ORDER_SERVICE_URL = 'http://localhost:3003/api/orders'; // Order-service URL

// Setup multer for license photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/* -------------------- DRIVER AUTHENTICATION -------------------- */

// ✅ Register a new driver
router.post('/register', upload.single('licensePhoto'), async (req, res) => {
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
});

// ✅ Login driver
router.post('/login', async (req, res) => {
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
});

/* -------------------- DRIVER PROFILE MANAGEMENT -------------------- */

// ✅ Get driver profile
router.get('/profile/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId).select('-password');

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    console.error('Profile Fetch Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ✅ Update driver profile
router.put('/profile/:driverId', async (req, res) => {
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
});

// ✅ Update driver availability
router.put('/availability/:driverId', async (req, res) => {
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
});

/* -------------------- DRIVER ORDERS MANAGEMENT (PROXIED TO ORDER-SERVICE) -------------------- */
// ============================
// Fetch Driver Orders
// ============================
router.get('/orders/driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/all`);
    const allOrders = response.data;

    const filteredOrders = allOrders.filter(order =>
      (order.orderStatus === 'ready' && (!order.assignedDriverId || order.assignedDriverId === null)) ||
      (order.assignedDriverId === driverId)
    );

    res.json(filteredOrders);
  } catch (err) {
    console.error("Error fetching driver's orders:", err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ============================
// Assign Driver to Order (Fix version)
// ============================
router.post('/orders/assign/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { assignedDriverId } = req.body;

    // ✅ Update BOTH assignedDriverId and orderStatus
    const response = await axios.patch(`${ORDER_SERVICE_URL}/${orderId}/update-status`, {
      assignedDriverId,
      orderStatus: "onTheWay",
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error assigning driver:', err.message);
    res.status(500).json({ message: 'Failed to assign order to driver' });
  }
});

// ============================
// Update Delivery Status (ongoing)
router.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  try {
    const response = await axios.patch(`${ORDER_SERVICE_URL}/${orderId}/update-status`, { orderStatus });
    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;