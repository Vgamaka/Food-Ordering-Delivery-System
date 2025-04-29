const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/customer/:customerId", orderController.getOrdersByCustomer);
router.get("/restaurant/:restaurantId", orderController.getOrdersByRestaurant);
router.patch("/:orderId/update-status", orderController.updateOrderStatusDirect);
router.put("/:orderId/status", orderController.updateOrderStatusDirect);
router.get("/all", orderController.getAllOrders);
router.patch("/cancel/:orderId", orderController.cancelOrder);
router.get("/details/:orderId", orderController.getOrderById);

module.exports = router;
