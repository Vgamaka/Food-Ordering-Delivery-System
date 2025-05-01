const Order = require("../models/Order");
const axios = require("axios");
const { sendSMS } = require("../services/dialogSmsService");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;



exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      restaurantId,
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      deliveryLocation,
    } = req.body;

    const DELIVERY_FEE = 250;
    const finalTotal = totalAmount + DELIVERY_FEE;

    //  Validate important fields
    if (!customerId || !restaurantId || !items || items.length === 0 || !deliveryAddress || !deliveryLocation?.coordinates?.length) {
      return res.status(400).json({ message: "Missing required fields or invalid delivery location" });
    }

    //  Fetch restaurant location safely
    const restaurantResponse = await axios.get(`${process.env.AUTH_SERVICE_URL}/users/${restaurantId}`);
    const restaurant = restaurantResponse.data;

    if (!restaurant || !restaurant.location || !restaurant.location.coordinates) {
      return res.status(400).json({ message: "Restaurant location not found or invalid" });
    }

    //  Format restaurant location correctly
    const formattedRestaurantLocation = {
      type: "Point",
      coordinates: restaurant.location.coordinates,
    };

    //  Format delivery location correctly
    const formattedDeliveryLocation = {
      type: "Point",
      coordinates: deliveryLocation.coordinates,
    };

    //  Create and save the new Order
    const newOrder = new Order({
      customerId,
      restaurantId,
      items,
      restaurantLocation: formattedRestaurantLocation,
      deliveryLocation: formattedDeliveryLocation,
      totalAmount: finalTotal,
      deliveryFee: DELIVERY_FEE,
      paymentMethod: paymentMethod || "cod",
      deliveryAddress,
      paymentStatus: paymentMethod === "card" ? "pending" : "unpaid",
      orderStatus: "pending", // Default
    });

    await newOrder.save();


    res.status(201).json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.error(" Error creating order:", err);
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
};



// Get all orders of a customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// Get all orders of a restaurant
exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


exports.updateOrderStatusDirect = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, paymentId, prepTime, rejectionReason } = req.body;
    const { assignedDriverId } = req.body;

    //  Prepare the update object
    const updateFields = {};

    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (paymentId) updateFields.paymentId = paymentId;
    if (assignedDriverId) updateFields.assignedDriverId = assignedDriverId;

    if (orderStatus === "accepted") {
      if (!prepTime || isNaN(prepTime)) {
        return res.status(400).json({ message: "Preparation time (prepTime) is required to accept the order." });
      }
      updateFields.orderStatus = "accepted";
      updateFields.prepTime = prepTime;
    } 
    else if (orderStatus === "rejected") {
      updateFields.orderStatus = "rejected";
      updateFields.rejectionReason = rejectionReason || "No reason provided";
    }
    else if (["ready", "onTheWay", "delivered", "cancelled"].includes(orderStatus)) {
      updateFields.orderStatus = orderStatus;
    }
    else {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (err) {
    console.error(" Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all orders", error: err.message });
  }
};

exports.getFilteredOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const orders = await Order.find({
      restaurantId,
      $or: [
        { paymentMethod: "cod", paymentStatus: "pending" },                      // COD logic ✅
        { paymentMethod: "card", paymentStatus: "paid", orderStatus: "confirmed" } // Card logic ✅
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching filtered orders:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "cancelled" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order cancelled successfully", order: updatedOrder });
  } catch (error) {
    console.error(" Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
};

