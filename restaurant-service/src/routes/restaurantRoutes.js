const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

// Get all approved restaurants (for frontend)
router.get("/restaurants", restaurantController.getAllApprovedRestaurants);

// Get single restaurant by ID
router.get("/restaurant/:id", restaurantController.getRestaurantById);

// Approve/Reject (for admin)
router.patch("/restaurant/:id/approve", restaurantController.approveRestaurant);
router.patch("/restaurant/:id/reject", restaurantController.rejectRestaurant);

// Profile update
router.put("/restaurant/:id", restaurantController.updateRestaurantProfile);

module.exports = router;
