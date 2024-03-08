const express = require('express');
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const { } = require('../controllers/productController');

router.route('/testproduct').get();

module.exports = router;