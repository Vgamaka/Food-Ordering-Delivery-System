const User = require("../models/User"); // Assuming you use 'User' for restaurant accounts
const authService = require("../services/authService");
const orderService = require("../services/orderService");

// 📌 Register Restaurant (called from authRoutes with multer upload)
exports.registerRestaurant = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({
      name,
      email,
      password, // Hash this if not already hashed in middleware
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

// 📌 Get all approved restaurants (for customer side)
exports.getAllApprovedRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant", status: "approved" });
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching restaurants", error: err.message });
  }
};
// Get all orders for a restaurant (called by frontend)
// exports.getRestaurantOrders = async (req, res) => {
//   try {
//     const { restaurantId } = req.query;

//     if (!restaurantId) {
//       return res.status(400).json({ message: "Restaurant ID is required" });
//     }

//     const orders = await orderService.getOrdersByRestaurant(restaurantId);
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching restaurant orders:", error.message);
//     res.status(500).json({ message: "Failed to fetch restaurant orders", error: error.message });
//   }
// };
// 📌 Get a single restaurant by ID (for menu pages)
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await authService.getUserById(req.params.id);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(404).json({ message: "Restaurant not found or invalid role" });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    console.error("Error fetching restaurant profile:", err.message);
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

// 📌 Approve restaurant
exports.approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { status: "approved" }, { new: true });
    res.status(200).json({ message: "Approved successfully", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error approving", error: err.message });
  }
};

// 📌 Reject restaurant
exports.rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
    res.status(200).json({ message: "Rejected", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting", error: err.message });
  }
};

// 📌 Update restaurant profile (optional feature)
exports.updateRestaurantProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await User.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
