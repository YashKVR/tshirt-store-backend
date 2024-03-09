const express = require('express');
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const { addProduct, getAllProduct } = require('../controllers/productController');

//user routes
router.route('/products').get(getAllProduct);


//admin Routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);

module.exports = router;