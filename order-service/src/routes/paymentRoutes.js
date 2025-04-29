const express = require("express");
const router = express.Router();
const { createPayHereHash} = require("../controllers/paymentController");

router.post("/payhere-hash", createPayHereHash); // Endpoint: /api/order/payhere-hash

module.exports = router;
