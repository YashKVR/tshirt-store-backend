const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxLength: [40, 'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [6, 'Password should be atleast 6 Characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    forgotPasswordToken: String,
    forgotPasswordToken: Date,
    createAt: {
        type: Date,
        default: Date.now
    }

})

//PRE - Hooks: encrypt password before save, you cannot use arrow function inside pre(mongoose limitation)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// validate the password with past on user password
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
    return await bcrypt.compare(usersendPassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

//generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toSTring('hex')

    //getting a hash - make sure to get a hash on backend as well
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')

    //time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotToken
}

module.exports = mongoose.model('User', userSchema)