const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;

    let parsedLocation = null;
    if (location) {
      if (typeof location === "string") {
        parsedLocation = JSON.parse(location);
      } else {
        parsedLocation = location; // already an object
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let restaurantDetails = {};
    let licenseImage = null;

    if (role === "restaurant") {
      restaurantDetails = {
        name: req.body.restaurantName,
        description: req.body.description,
        proofImage: req.files?.proofImage?.[0]?.filename || "",
      };
    }

    if (role === "delivery") {
      licenseImage = req.files?.licenseImage?.[0]?.filename || "";
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      location: parsedLocation,
      restaurantDetails,
      licenseImage,
    });

    await user.save();
    return res.status(201).json({ message: 'User registered successfully', userId: user._id });

  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Login Error: Email or password not provided");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.error("Login Error: User not found for email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.error("Login Error: Password does not match for email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === 'pending') {
      console.error("Login Error: Account pending approval for email:", email);
      return res.status(403).json({ message: 'Account pending approval' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        restaurantDetails: user.restaurantDetails,
      }
    });

  } catch (err) {
    console.error("Login Server Error:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Verify token validity
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(401).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, decoded });

  } catch (err) {
    return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: 'pending',
      role: { $in: ['restaurant', 'delivery'] },
    });

    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'approved' },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ message: 'User approved', user });
  } catch (err) {
    return res.status(500).json({ message: 'Approval failed', error: err.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'rejected' },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ message: 'User rejected', user });
  } catch (err) {
    return res.status(500).json({ message: 'Rejection failed', error: err.message });
  }
};

exports.getUsersByRoleAndSearch = async (req, res) => {
  try {
    const { role, search, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { status: "approved" };

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).skip(skip).limit(limit);
    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

// PUT /api/auth/restaurant/:id/status
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen, description } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "restaurant") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    user.restaurantDetails.isOpen = isOpen;
    if (description !== undefined) {
      user.restaurantDetails.description = description;
    }

    await user.save();
    res.status(200).json({ message: "Restaurant status updated", restaurantDetails: user.restaurantDetails });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

// GET /api/auth/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};
// Update full restaurant profile
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

    let parsedLocation = null;
    if (location) {
      try {
        const loc = typeof location === "string" ? JSON.parse(location) : location;
        parsedLocation = {
          type: "Point",
          coordinates: [parseFloat(loc.lng), parseFloat(loc.lat)],
        };
      } catch (e) {
        return res.status(400).json({ message: "Invalid location format", error: e.message });
      }
    }
    
    const updateData = {
      name,
      email,
      phone,
      location: parsedLocation,
      restaurantDetails: {
        name: restaurantName,
        description,
        isOpen: isOpen === "true" || isOpen === true,
      },
    };
    
    console.log("🧾 Parsed Location:", parsedLocation);

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    return res.status(500).json({ message: "Update error", error: err.message });
  }
};

// src/controllers/authController.js
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};
