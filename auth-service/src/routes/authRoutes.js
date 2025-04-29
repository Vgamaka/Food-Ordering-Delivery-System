const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require("multer");
const path = require("path");
const { updateRestaurantStatus } = require("../controllers/authController");
const {googleLogin} = require('../controllers/googleAuthController');

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// Registration route (handle image)
// Accept either `proofImage` or `licenseImage`
const fileUpload = upload.fields([
    { name: "proofImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]);
  
router.post('/register', fileUpload, authController.registerUser);
  

//google-login
router.post('/google-login',googleLogin);

// Login route
router.post('/login', authController.loginUser);

// Token verification route
router.post('/verify-token', authController.verifyToken);

// Get all pending restaurant and delivery users
router.get('/pending-users', authController.getPendingUsers);

// Approve user account
router.patch('/approve/:id', authController.approveUser);

// Reject user account
router.patch('/reject/:id', authController.rejectUser);

router.get('/users', authController.getUsersByRoleAndSearch);

router.delete('/user/:id', authController.deleteUser);
//  update status
router.put("/restaurant/:id/status", updateRestaurantStatus);
router.get("/users/:id", authController.getUserById);
router.delete('/users/:id', authController.deleteUser);
// Update full restaurant profile
router.put('/restaurant/:id', upload.none(), authController.updateRestaurantProfile);
// src/routes/authRoutes.js
router.put('/users/:id', authController.updateUserProfile);

module.exports = router;
