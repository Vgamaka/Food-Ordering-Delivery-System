

const Order = require("../models/Order");
const axios = require("axios");
const { sendSMS } = require("../services/notificationService");

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;
const AUTH_SERVICE_URL       = process.env.AUTH_SERVICE_URL;


/**
 * Create a new order
 */
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
      phone
    } = req.body;

    // validate inputs
    if (
      !customerId ||
      !restaurantId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryAddress ||
      !deliveryLocation?.coordinates?.length
    ) {
      return res.status(400).json({ message: "Missing required fields or invalid delivery location" });
    }

    // add delivery fee
    const DELIVERY_FEE = 250;
    const finalTotal = totalAmount + DELIVERY_FEE;

    // fetch restaurant to get its geo-coordinates
    let restaurant;
    try {
      const url = `${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`;
      const { data } = await axios.get(url);
      restaurant = data;
    } catch (fetchErr) {
      console.error("Failed to fetch restaurant info:", fetchErr.message);
      return res.status(502).json({ message: "Failed to fetch restaurant information" });
    }

    if (!restaurant.location?.coordinates?.length) {
      return res.status(400).json({ message: "Restaurant location not found or invalid" });
    }

    // build & save order
    const newOrder = new Order({
      customerId,
      restaurantId,
      items,
      restaurantLocation: restaurant.location,
      deliveryLocation,
      totalAmount: finalTotal,
      deliveryFee: DELIVERY_FEE,
      paymentMethod: paymentMethod || "cod",
      deliveryAddress,
      paymentStatus: paymentMethod === "card" ? "pending" : "unpaid",
      orderStatus: "pending",
    });

    await newOrder.save();

    // send confirmation SMS to customer (if phone provided)
    if (phone) {
      try {
        const itemList = items.map(i => `${i.name} x ${i.quantity}`).join(", ");
        const message =
          `📦 ORDER CONFIRMED\n` +
          `Items: ${itemList}\n` +
          `Delivery Fee: Rs. ${DELIVERY_FEE}\n` +
          `Total: Rs. ${finalTotal}\n` +
          `Payment: ${paymentMethod.toUpperCase()}\n` +
          `Thank you for ordering!`;
        await sendSMS(phone, message);
      } catch (smsErr) {
        console.error("SMS send error:", smsErr.message);
      }
    }

    return res.status(201).json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Error placing order", error: err.message });
  }
};


/**
 * Get all orders for a given customer
 */
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    return res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};


/**
 * Get all orders for a given restaurant
 */
exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Error fetching restaurant orders:", err);
    return res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};


/**
 * Update an order’s status (accept, reject, ready, onTheWay, delivered, etc.)
 */
exports.updateOrderStatusDirect = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      orderStatus,
      paymentStatus,
      paymentId,
      prepTime,
      rejectionReason,
      assignedDriverId
    } = req.body;

    const updateFields = {};

    if (paymentStatus)  updateFields.paymentStatus  = paymentStatus;
    if (paymentId)      updateFields.paymentId      = paymentId;
    if (assignedDriverId) updateFields.assignedDriverId = assignedDriverId;

    // handle status transitions
    if (orderStatus === "accepted") {
      if (!prepTime || isNaN(prepTime)) {
        return res.status(400).json({ message: "prepTime is required to accept the order." });
      }
      updateFields.orderStatus = "accepted";
      updateFields.prepTime    = prepTime;
    }
    else if (orderStatus === "rejected") {
      updateFields.orderStatus     = "rejected";
      updateFields.rejectionReason = rejectionReason || "No reason provided";
    }
    else if (["confirmed", "ready", "onTheWay", "delivered", "cancelled"].includes(orderStatus)) {
      updateFields.orderStatus = orderStatus;
    }
    else {
      return res.status(400).json({ message: "Invalid orderStatus value." });
    }

    const updated = await Order.findByIdAndUpdate(orderId, { $set: updateFields }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    // on delivery, send a “delivered” SMS to customer
    if (orderStatus === "delivered") {
      try {
        const url = `${AUTH_SERVICE_URL}/users/${updated.customerId}`;
        const { data: customer } = await axios.get(url);
        if (customer.phone) {
          await sendSMS(
            customer.phone,
            `✅ Your order ${updated._id} has been delivered. Enjoy!`
          );
        }
      } catch (smsErr) {
        console.error("Failed to send delivery SMS:", smsErr.message);
      }
    }

    return res.json({ message: "Order updated successfully", order: updated });

  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};


/**
 * Get every order (e.g. admin view)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return res.status(500).json({ message: "Error fetching all orders", error: err.message });
  }
};


/**
 * Get only “pending COD” or “confirmed card” orders for a restaurant
 */
exports.getFilteredOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const orders = await Order.find({
      restaurantId,
      $or: [
        { paymentMethod: "cod",  paymentStatus: "pending" },
        { paymentMethod: "card", paymentStatus: "paid", orderStatus: "confirmed" }
      ]
    }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("Error fetching filtered orders:", err);
    return res.status(500).json({ message: "Failed to fetch filtered orders", error: err.message });
  }
};


/**
 * Cancel an order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updated = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "cancelled" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json({ message: "Order cancelled successfully", order: updated });
  } catch (err) {
    console.error("Error cancelling order:", err);
    return res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};


/**
 * Get a single order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return res.status(500).json({ message: "Error fetching order", error: err.message });
  }
};
