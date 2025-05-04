const express = require('express');
const router = express.Router();
const { createHashHandler } = require('../controllers/payhereController');

router.post('/payment/hash', createHashHandler);

module.exports = router;
