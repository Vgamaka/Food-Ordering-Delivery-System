
const orderService = require("../services/orderService");

exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      console.error("🚨 restaurantId is missing in the query parameters");
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    console.log("🚀 Calling orderService with restaurantId:", restaurantId);

    const orders = await orderService.getOrdersByRestaurant(restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching restaurant orders:", error.message);
    res.status(500).json({ message: "Failed to fetch restaurant orders", error: error.message });
  }
};

// Accept an order (restaurant sets prepTime)
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { prepTime } = req.body;

    if (!prepTime || isNaN(prepTime)) {
      return res.status(400).json({ message: "Valid preparation time is required" });
    }

    const updatedOrder = await orderService.acceptOrder(orderId, prepTime);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order accepted successfully", order: updatedOrder });
  } catch (err) {
    console.error("Error accepting order:", err);
    res.status(500).json({ message: "Failed to accept order", error: err.message });
  }
};

// Reject an order
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await orderService.rejectOrder(orderId);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }


    res.status(200).json({ message: "Order rejected successfully", order: updatedOrder });
  } catch (err) {
    console.error("Error rejecting order:", err);
    res.status(500).json({ message: "Failed to reject order", error: err.message });
  }
};
