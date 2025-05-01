const User = require("../models/User");
const authService = require("../services/authService");
const orderService = require("../services/orderService");

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
      password, 
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

exports.getAllApprovedRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant", status: "approved" });
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching restaurants", error: err.message });
  }
};

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

//  Approve restaurant
exports.approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { status: "approved" }, { new: true });
    res.status(200).json({ message: "Approved successfully", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error approving", error: err.message });
  }
};

//  Reject restaurant
exports.rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
    res.status(200).json({ message: "Rejected", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting", error: err.message });
  }
};

// Update restaurant profile 
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
