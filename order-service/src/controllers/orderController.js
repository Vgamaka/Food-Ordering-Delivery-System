const Order = require("../models/Order");
const axios = require("axios");
const { sendSMS } = require("../services/dialogSmsService");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       customerId,
//       restaurantId,
//       items,
//       totalAmount,
//       paymentMethod,
//       deliveryAddress,
//       deliveryLocation,
//     } = req.body;

//     const DELIVERY_FEE = 250;                                  // ✅ Define delivery fee
//     const finalTotal = totalAmount + DELIVERY_FEE; 

//     if (!customerId || !restaurantId || !items || items.length === 0) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Fetch restaurant location from auth service
//     const restaurantResponse = await axios.get(`${process.env.AUTH_SERVICE_URL}/users/${restaurantId}`);
//     const restaurant = restaurantResponse.data;

//     if (!restaurant || !restaurant.location) {
//       return res.status(400).json({ message: "Restaurant location not found" });
//     }

//     const newOrder = new Order({
//       customerId,
//       restaurantId,
//       items,
//       restaurantLocation: restaurant.location,
//       totalAmount:finalTotal,
//       deliveryFee: DELIVERY_FEE,
//       paymentMethod: paymentMethod || "cod", // default fallback
//       deliveryAddress,
//       deliveryLocation, // ✅ added this
//       paymentStatus: paymentMethod === "card" ? "pending" : "unpaid",

//     });

//     await newOrder.save();

//     // ✅ Send SMS after order placed successfully req.body.phone ||
//     /*try {
//       const customerPhone =  "0729707610"; // Replace with the correct phone field if available
//       const DELIVERY_FEE = 250;
//       const itemList = items.map(item => `${item.name} x ${item.quantity}`).join(", ");
//       const finalTotal = totalAmount + DELIVERY_FEE;

//       const message =
//         `ORDER CONFIRMATION\n` +
//         `-------------------------\n` +
//         `Items: ${itemList}\n` +
//         `Delivery Fee: Rs. ${DELIVERY_FEE}\n` +
//         `Total Amount: Rs. ${finalTotal}\n` +
//         `Payment Method: ${paymentMethod.toUpperCase()}\n` +
//         `Date & Time: ${new Date().toLocaleString()}\n` +
//         `-------------------------\n` +
//         `Thank you for ordering with Food Delivery App!`;

//       console.log("📤 SMS sending to:", customerPhone);
//       console.log("📤 SMS content:\n", message); // Debugging purpose

//       await sendSMS(customerPhone, message);
//     } catch (smsError) {
//       console.error('⚠️ SMS sending failed:', smsError.message);
//     }*/


//     res.status(201).json({ message: "Order placed successfully", order: newOrder });

//   } catch (err) {
//     console.error("Error creating order:", err);
//     res.status(500).json({ message: "Error placing order", error: err.message });
//   }
// };


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

    // ✅ Validate important fields
    if (!customerId || !restaurantId || !items || items.length === 0 || !deliveryAddress || !deliveryLocation?.coordinates?.length) {
      return res.status(400).json({ message: "Missing required fields or invalid delivery location" });
    }

    // ✅ Fetch restaurant location safely
    const restaurantResponse = await axios.get(`${process.env.AUTH_SERVICE_URL}/users/${restaurantId}`);
    const restaurant = restaurantResponse.data;

    if (!restaurant || !restaurant.location || !restaurant.location.coordinates) {
      return res.status(400).json({ message: "Restaurant location not found or invalid" });
    }

    // ✅ Format restaurant location correctly
    const formattedRestaurantLocation = {
      type: "Point",
      coordinates: restaurant.location.coordinates,
    };

    // ✅ Format delivery location correctly
    const formattedDeliveryLocation = {
      type: "Point",
      coordinates: deliveryLocation.coordinates,
    };

    // ✅ Create and save the new Order
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

    // ✅ (Optional) You can add SMS notification here if needed
    /*
    try {
      const customerPhone = req.body.phone || "0729707610"; // fallback
      const itemList = items.map(item => `${item.name} x ${item.quantity}`).join(", ");
      const message =
        `ORDER CONFIRMATION\n` +
        `-------------------------\n` +
        `Items: ${itemList}\n` +
        `Delivery Fee: Rs. ${DELIVERY_FEE}\n` +
        `Total Amount: Rs. ${finalTotal}\n` +
        `Payment Method: ${paymentMethod.toUpperCase()}\n` +
        `Date & Time: ${new Date().toLocaleString()}\n` +
        `-------------------------\n` +
        `Thank you for ordering with Food Delivery App!`;

      await sendSMS(customerPhone, message);
    } catch (smsError) {
      console.error('⚠️ SMS sending failed:', smsError.message);
    }
    */

    res.status(201).json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
};



//   try {
//     const {
//       customerId,
//       restaurantId,
//       items,
//       totalAmount,
//       paymentMethod,
//       deliveryAddress,
//       deliveryLocation,
//     } = req.body;

//     const DELIVERY_FEE = 250;
//     const finalTotal = totalAmount + DELIVERY_FEE;

//     if (!customerId || !restaurantId || !items || items.length === 0) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Fetch restaurant location from auth service
//     const restaurantResponse = await axios.get(`${process.env.AUTH_SERVICE_URL}/users/${restaurantId}`);
//     const restaurant = restaurantResponse.data;

//     if (!restaurant || !restaurant.location || !restaurant.location.coordinates) {
//       return res.status(400).json({ message: "Restaurant location not found or invalid" });
//     }

//     // ✅ Correct formatting for restaurantLocation and deliveryLocation
//     const formattedRestaurantLocation = {
//       type: "Point",
//       coordinates: restaurant.location.coordinates,
//     };

//     const formattedDeliveryLocation = {
//       type: "Point",
//       coordinates: deliveryLocation?.coordinates || [],
//     };

//     if (!formattedDeliveryLocation.coordinates.length) {
//       return res.status(400).json({ message: "Delivery location is missing or invalid" });
//     }

//     const newOrder = new Order({
//       customerId,
//       restaurantId,
//       items,
//       restaurantLocation: formattedRestaurantLocation,
//       deliveryLocation: formattedDeliveryLocation,
//       totalAmount: finalTotal,
//       deliveryFee: DELIVERY_FEE,
//       paymentMethod: paymentMethod || "cod",
//       deliveryAddress,
//       paymentStatus: paymentMethod === "card" ? "pending" : "unpaid",
//     });

//     await newOrder.save();

//     res.status(201).json({ message: "Order placed successfully", order: newOrder });

//   } catch (err) {
//     console.error("❌ Error creating order:", err);
//     res.status(500).json({ message: "Error placing order", error: err.message });
//   }
// };


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


// ✅ Update order status directly (handles prepTime, rejectionReason, and ready status logic)
// exports.updateOrderStatusDirect = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { orderStatus, paymentStatus, paymentId, prepTime, rejectionReason } = req.body;

//     // ✅ Prepare the update object
//     const updateFields = {};

//     if (paymentStatus) updateFields.paymentStatus = paymentStatus;
//     if (paymentId) updateFields.paymentId = paymentId;

//     if (orderStatus === "accepted") {
//       if (!prepTime || isNaN(prepTime)) {
//         return res.status(400).json({ message: "Preparation time (prepTime) is required to accept the order." });
//       }
//       updateFields.orderStatus = "accepted";
//       updateFields.prepTime = prepTime;
//     } else if (orderStatus === "rejected") {
//       updateFields.orderStatus = "rejected";
//       updateFields.rejectionReason = rejectionReason || "No reason provided";
//     } else if (orderStatus === "ready") {
//       updateFields.orderStatus = "ready";
//     } else {
//       return res.status(400).json({ message: "Invalid order status. Only 'accepted', 'rejected', or 'ready' allowed." });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { $set: updateFields },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     return res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
//   } catch (err) {
//     console.error("❌ Error updating order status:", err);
//     res.status(500).json({ message: "Failed to update order status", error: err.message });
//   }
// };

exports.updateOrderStatusDirect = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, paymentId, prepTime, rejectionReason } = req.body;
    const { assignedDriverId } = req.body;

    // ✅ Prepare the update object
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
      // ✅ Directly update if status is ready, onTheWay, delivered, or cancelled
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
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};


// Add this new function
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all orders", error: err.message });
  }
};

// ✅ Filtered orders (COD pending OR Card paid + confirmed)
exports.getFilteredOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    // 🟢 THIS IS WHERE YOUR FILTER LOGIC IS APPLIED 👇
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
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

// GET /api/orders/details/:orderId
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

