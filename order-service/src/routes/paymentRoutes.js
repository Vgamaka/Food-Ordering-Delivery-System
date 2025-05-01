const express = require("express");
const router = express.Router();
const { createPayHereHash} = require("../controllers/paymentController");

router.post("/payhere-hash", createPayHereHash); 
module.exports = router;
