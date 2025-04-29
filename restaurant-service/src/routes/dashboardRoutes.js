const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Route: /api/dashboard/:restaurantId
router.get("/:restaurantId", dashboardController.getDashboardStats);

// Route: /api/dashboard/:restaurantId/chart?filter=monthly|weekly
router.get("/:restaurantId/chart", dashboardController.getChartData);

module.exports = router;
