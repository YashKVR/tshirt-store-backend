const User = require('../models')
const BigPromise = require("./bigPromise")
const CustomError = require("../utils/customError")
const jwt = require('jsonwebtoken')

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization").replace('Bearer ', '')

    if (!token) {
        return next(new CustomError('Login First to access this page'), 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // req.user can be called any thing like req.superman. I am injecting my property to req.
    req.user = User.findById(decoded.id)

    next()

})