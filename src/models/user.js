const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(validator.contains(value, 'password', {ignoreCase: true})) {
                throw new Error ("Password must not contain the word 'password'")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    }, 
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//instead of storing tasks array, store as virtual - relationship between 2 entities
userSchema.virtual('taskList', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//methods are accessible on instances
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign( { _id: user._id.toString() }, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userPublicData = user.toObject()

    delete userPublicData.password
    delete userPublicData.tokens
    delete userPublicData.avatar

    return userPublicData
}

// Implement a function to findByCredentials on the User model. Statics are accessible on model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( { email })
    
    if (!user) {
        throw new Error('Unable to login')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

//use schema to setup middleware to hash the plain-text pw before saving
// Not an arrow function because we need this binding
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

//Middleware to delete user tasks when user is removed
userSchema.pre('remove', async function (next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User