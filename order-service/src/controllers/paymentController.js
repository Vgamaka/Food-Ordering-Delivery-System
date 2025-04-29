const { generatePayHereHash } = require("../services/payhereService");
const Order = require("../models/Order");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { getUserById } = require("../services/userService");
const { sendSMS } = require("../services/dialogSmsService");

// ✅ LOG FUNCTION
const logToFile = (message) => {
  const logPath = path.join(__dirname, "../logs/notify.log");
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
};

// ✅ CREATE HASH FOR PAYMENT INITIALIZATION
exports.createPayHereHash = (req, res) => {
  const { order_id, amount, currency = "LKR" } = req.body;
  if (!order_id || !amount) {
    return res.status(400).json({ message: "order_id and amount are required." });
  }
  try {
    const hash = generatePayHereHash(order_id, amount, currency);
    return res.json({ hash });
  } catch (error) {
    console.error("❌ Error generating hash:", error);
    return res.status(500).json({ message: "Error generating hash." });
  }
};
