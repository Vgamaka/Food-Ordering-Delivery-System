
const User = require("../models/User");
const authService = require("../services/authService");
const orderService = require("../services/orderService");
const bcrypt = require("bcrypt");            // for password hashing

// ─── RESTAURANT-RELATED HANDLERS ──────────────────────────────────────────────

// Register a new restaurant
exports.registerRestaurant = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashed,
      phone,
      role: "restaurant",
      status: "pending",
      proofImage: req.files?.proofImage?.[0]?.filename || "",
    });
    await newUser.save();
    res.status(201).json({ message: "Restaurant registered", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Error registering restaurant", error: err.message });
  }
};

// Get all approved restaurants
exports.getAllApprovedRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant", status: "approved" });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching restaurants", error: err.message });
  }
};

// Get a single restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await authService.getUserById(req.params.id);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(404).json({ message: "Restaurant not found or invalid role" });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

// Approve or reject a restaurant
exports.approveRestaurant = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    res.json({ message: "Approved successfully", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error approving", error: err.message });
  }
};
exports.rejectRestaurant = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    res.json({ message: "Rejected", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting", error: err.message });
  }
};

// Update restaurant profile
exports.updateRestaurantProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      phone,
      location,
      restaurantName,
      description,
      isOpen,
    } = req.body;

    // Build payload for auth-service
    const payload = {};
    if (name)  payload.name = name;
    if (email) payload.email = email;
    if (password) payload.password = password;
    if (phone) payload.phone = phone;

    // Parse and include location if provided
    if (location) {
      const loc = typeof location === "string" ? JSON.parse(location) : location;
      payload.location = {
        type: "Point",
        coordinates: [parseFloat(loc.lng), parseFloat(loc.lat)],
      };
    }

    // Include restaurant-specific details
    payload.restaurantDetails = {
      ...(restaurantName !== undefined && { name: restaurantName }),
      ...(description    !== undefined && { description }),
      ...(isOpen         !== undefined && { isOpen }),
    };

    // Send update to auth-service
    const updatedUser = await authService.updateUser(id, payload);
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile via auth-service:", err.message);
    const status = err.response?.status || 500;
    const data   = err.response?.data   || { message: err.message };
    res.status(status).json(data);
  }
};



// ─── ORDER-RELATED HANDLERS ──────────────────────────────────────────────────

// Get all orders for a given restaurant
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const orders = await orderService.getOrdersByRestaurant(restaurantId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch restaurant orders", error: err.message });
  }
};

// Accept (set prepTime) or reject an order
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { prepTime } = req.body;
    if (!prepTime || isNaN(prepTime)) {
      return res.status(400).json({ message: "Valid preparation time is required" });
    }
    const updated = await orderService.acceptOrder(orderId, prepTime);
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order accepted successfully", order: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept order", error: err.message });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updated = await orderService.rejectOrder(orderId);
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order rejected successfully", order: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject order", error: err.message });
  }
};
// Delete restaurant account
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    await authService.deleteUser(id);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account via auth-service:", err.message);
    const status = err.response?.status || 500;
    const data   = err.response?.data   || { message: err.message };
    res.status(status).json(data);
  }
};
