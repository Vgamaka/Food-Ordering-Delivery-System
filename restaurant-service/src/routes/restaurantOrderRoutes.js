const express = require("express");
const router = express.Router();
const restaurantOrderController = require("../controllers/restaurantOrderController");

// GET orders for restaurant using query param
router.get("/", restaurantOrderController.getRestaurantOrders);

// Accept/Reject order
router.patch("/:orderId/accept", restaurantOrderController.acceptOrder);
router.patch("/:orderId/reject", restaurantOrderController.rejectOrder);

module.exports = router;
