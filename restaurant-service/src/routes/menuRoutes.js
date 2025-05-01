const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const menuController = require("../controllers/menuController");

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), menuController.createMenuItem);
router.get("/:restaurantId", menuController.getMenuItemsByRestaurant);
router.put("/:menuItemId", upload.single("image"), menuController.updateMenuItem);
router.delete("/:menuItemId", menuController.deleteMenuItem);

router.get("/list/all", menuController.getAllMenuItems);

module.exports = router;
