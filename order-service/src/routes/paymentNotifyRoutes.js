const express = require('express');
const router = express.Router();
const { handlePayHereNotify } = require('../controllers/paymentNotifyController');

// PayHere notification endpoint
router.post('/payhere-notify', handlePayHereNotify);

module.exports = router;
