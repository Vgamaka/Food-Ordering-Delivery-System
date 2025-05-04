const express = require('express');
const router = express.Router();
const multer = require('multer');
const driverController = require('../controllers/driverController');

// Configure multer for file uploads
const storage = multer.diskStorage(driverController.getMulterStorage());
const upload = multer({ storage: storage });

/* -------------------- DRIVER AUTHENTICATION -------------------- */

// Register a new driver
router.post('/register', upload.single('licensePhoto'), driverController.registerDriver);

// Login driver
router.post('/login', driverController.loginDriver);

/* -------------------- DRIVER PROFILE MANAGEMENT -------------------- */

// Get driver profile
router.get('/profile/:driverId', driverController.getDriverProfile);

// Update driver profile
router.put('/profile/:driverId', driverController.updateDriverProfile);

// Update driver availability
router.put('/availability/:driverId', driverController.updateDriverAvailability);

/* -------------------- DRIVER ORDERS MANAGEMENT (PROXIED TO ORDER-SERVICE) -------------------- */

// Fetch Driver Orders
router.get('/orders/driver/:driverId', driverController.getDriverOrders);

// Assign Driver to Order
router.post('/orders/assign/:orderId', driverController.assignDriverToOrder);

// Update Delivery Status
router.put('/orders/:orderId/status', driverController.updateOrderStatus);

module.exports = router;