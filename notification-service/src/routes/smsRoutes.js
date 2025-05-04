const express = require('express');
const router = express.Router();
const { sendSMSHandler } = require('../controllers/smsController');

router.post('/sms', sendSMSHandler);

module.exports = router;
