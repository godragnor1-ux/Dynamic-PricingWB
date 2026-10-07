const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// POST /api/checkout : Process checkout
router.post('/', checkoutController.processCheckout);

module.exports = router;
