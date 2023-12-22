const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise")
const CustomError = require('../utils/customError')
const cookieToken = require("../utils/cookieToken")
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require("../utils/emailHelper")
const crypto = require('crypto')

exports.signup = BigPromise(async (req, res, next) => {
    // let result;

    if (!req.files) {
        return next(new CustomError("photo is required for signup", 400))
    }

    const { name, email, password } = req.body
    if (!email || !name || !password) {
        return next(new CustomError('Name, email and password are required fields', 400))
    }

    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "user",
        width: 150,
        crop: "scale"
    })

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user, res)
})

exports.login = BigPromise(async (req, res, next) => {
    const { email, password } = req.body

    //check for presence for email and password
    if (!email || !password) {
        return next(new CustomError('Please provide email and password', 400))
    }

    //get user from BD
    const user = await User.findOne({ email }).select("+password")

    //if user not found in DB
    if (!user) {
        return next(new CustomError('Email or password does not match or exist', 400))
    }

    //match the passowrd
    const isPasswordCorrect = await user.isValidatedPassword(password)

    //if password do not match
    if (!isPasswordCorrect) {
        return next(new CustomError('Email or password does not match or exist', 400))
    }

    //if all goes good then we send the token
    cookieToken(user, res)

})

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logout Success"
    })
})

exports.forgotPassword = BigPromise(async (req, res, next) => {
    // collect email
    const { email } = req.body;
    console.log(email);
    // find user in database
    const user = await User.findOne({ email });

    // if user not found in database
    if (!user) {
        return next(new CustomError("Email not found as registered", 400));
    }

    //get token from user model methods
    const forgotToken = user.getForgotPasswordToken();

    // save user fields in DB
    await user.save({ validateBeforeSave: false });

    // create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    //URL for deployment as front end might be running at different URL
    // const myUrl = `${process.env.FRONT_END}/password/reset/${forgotToken}`;

    // craft a message
    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    // attempt to send email
    try {
        await mailHelper({
            email: user.email,
            subject: "Yash TStore - Password reset email",
            message,
        });

        // json reponse if email is success
        res.status(200).json({
            succes: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        // reset user fields if things goes wrong
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        // send error response
        return next(new CustomError(error.message, 500));
    }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
    //get token from params
    const token = req.params.token;

    // hash the token as db also stores the hashed version
    const encryToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user based on hased on token and time in future
    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return next(new CustomError("Token is invalid or expired", 400));
    }

    // check if password and conf password matched
    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new CustomError("password and confirm password do not match", 400)
        );
    }

    // update password field in DB
    user.password = req.body.password;

    // reset token fields
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // save the user
    await user.save();

    // send a JSON response OR send token

    cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
    //req.user doesn't exist, we have injected it in the user middleware
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
});

exports.changePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id

    const user = await User.findById(userId).select("+password")

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)

    if (!isCorrectOldPassword) {
        return next(new CustomError('old password is incorrect'), 500)
    }

    user.password = req.body.password

    await user.save()

    cookieToken(user, res)
})

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    //check if all field are available, if any field is not there, it will be updated as empty
    if (!req.body.name || !req.body.email) {
        return next(new CustomError('All fields should be returned while updating'), 500)
    }

    const newData = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.files) {
        const user = await User.findById(req.user.id)

        const imageId = user.photo.id

        // delete photo on cloudinary
        const resp = await cloudinary.v2.uploader.destroy(imageId)

        //upload the new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: "user",
            width: 150,
            crop: "scale"
        })

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }

    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        succes: true,
    })
})