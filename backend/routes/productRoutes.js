const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products : Fetch all products
router.get('/', productController.getAllProducts);

// POST /api/products/:id/view : Increment views_count
router.post('/:id/view', productController.incrementViewCount);

module.exports = router;
