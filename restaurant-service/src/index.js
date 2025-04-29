require('dotenv').config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require('./config/db');

// Import routes
const menuRoutes = require("./routes/menuRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const restaurantOrderRoutes = require("./routes/restaurantOrderRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/restaurant", dashboardRoutes); // ✅ Corrected
app.use("/api/restaurant/profile", restaurantRoutes);
app.use("/api/restaurant/orders", restaurantOrderRoutes);
app.use('/api', require('./routes/restaurantRoutes'));
app.use("/api/dashboard", dashboardRoutes); 

// Health check
app.get("/", (req, res) => {
  res.send("Restaurant Service is running");
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Restaurant Service running at http://localhost:${PORT}`);
});
