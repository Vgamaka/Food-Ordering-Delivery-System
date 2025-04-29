const MenuItem = require("../models/MenuItem");

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, description, price, available, quantity, category } = req.body;

    const newItem = new MenuItem({
      restaurantId,
      name,
      description,
      price,
      available,
      quantity,
      category,
      image: req.file?.filename,
    });

    await newItem.save();
    res.status(201).json({ message: "Menu item created", item: newItem });
  } catch (err) {
    res.status(500).json({ message: "Error creating menu item", error: err.message });
  }
};

// Get all menu items for a restaurant
exports.getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await MenuItem.find({ restaurantId });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err.message });
  }
};

// Get ALL menu items from ALL restaurants
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all menu items", error: err.message });
  }
};


// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.image = req.file.filename;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(menuItemId, updates, { new: true });
    res.status(200).json({ message: "Item updated", item: updatedItem });
  } catch (err) {
    res.status(500).json({ message: "Error updating item", error: err.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    await MenuItem.findByIdAndDelete(menuItemId);
    res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err.message });
  }
};
// Get a single menu item by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json(menuItem);
  } catch (err) {
    res.status(500).json({ message: "Error fetching menu item", error: err.message });
  }
};
