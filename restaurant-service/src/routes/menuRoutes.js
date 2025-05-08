const express = require("express");
const multer  = require("multer");
const path    = require("path");
const router  = express.Router();
const menuController = require("../controllers/menuController");

// ─── Multer configuration ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ─── Routes ──────────────────────────────────────────────────────────────────

// 1) Create a new menu item
//    POST /api/menu
router.post(
  "/",
  upload.single("image"),
  menuController.createMenuItem
);

// 2) Get all items for a specific restaurant
//    GET /api/menu/restaurant/:restaurantId
router.get(
  "/restaurant/:restaurantId",
  menuController.getMenuItemsByRestaurant
);

// 3) Get all items across all restaurants (admin)
//    GET /api/menu/list/all
router.get(
  "/list/all",
  menuController.getAllMenuItems
);

// 4) Get a single menu item by its ID
//    GET /api/menu/:menuItemId
router.get(
  "/:menuItemId",
  menuController.getMenuItemById
);

// 5) Update a menu item (with optional new image)
//    PUT /api/menu/:menuItemId
router.put(
  "/:menuItemId",
  upload.single("image"),
  menuController.updateMenuItem
);

// 6) Delete a menu item
//    DELETE /api/menu/:menuItemId
router.delete(
  "/:menuItemId",
  menuController.deleteMenuItem
);

module.exports = router;
