const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/restaurantController");

// ── Restaurant endpoints ──────────────────────────────────────────

// Register
router.post("/", ctrl.registerRestaurant);

// List & single fetch
router.get("/",    ctrl.getAllApprovedRestaurants);
router.get("/:id", ctrl.getRestaurantById);

// Approve / Reject
router.patch("/:id/approve", ctrl.approveRestaurant);
router.patch("/:id/reject",  ctrl.rejectRestaurant);

// Profile update
router.put("/:id/profile", ctrl.updateRestaurantProfile);

// Delete account
router.delete("/:id", ctrl.deleteRestaurant);

// ── Order endpoints ───────────────────────────────────────────────

// Get all orders for this restaurant (pass ?restaurantId=…)
router.get("/orders", ctrl.getRestaurantOrders);

// Accept / reject a specific order
router.patch("/orders/:orderId/accept", ctrl.acceptOrder);
router.patch("/orders/:orderId/reject",  ctrl.rejectOrder);

module.exports = router;
