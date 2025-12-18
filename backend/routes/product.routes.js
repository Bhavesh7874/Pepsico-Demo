const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getProducts, createProduct, deleteProduct } = require('../controllers/product.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/', getProducts);

router.post(
    '/',
    [
        protect,
        admin,
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price is required').isNumeric(),
        check('description', 'Description is required').not().isEmpty()
    ],
    createProduct
);

router.delete('/:id', [protect, admin], deleteProduct);

module.exports = router;
