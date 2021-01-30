const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false
})

// const User = mongoose.model('User' ,{
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         validate(value) {
//             if(!validator.isEmail(value)) {
//                 throw new Error('Email is invalid')
//             }
//         }
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 7,
//         trim: true,
//         validate(value) {
//             if(validator.contains(value, 'password', {ignoreCase: true})) {
//                 throw new Error ("Password must not contain the word 'password'")
//             }
//         }
//     },
//     age: {
//         type: Number,
//         default: 0,
//         validate(value) {
//             if (value < 0) {
//                 throw new Error('Age must be a positive number')
//             }
//         }
//     }
// })

// const aPerson  = new User({
//     name: '   MyNAME   ',
//     email: ' MYEMAIL@email.com  ',
//     password: 'IAmtheSun   '
// })

// aPerson.save().then(() => {
//     console.log(aPerson)
// }).catch( (error) => {
//     console.log('Error!', error)
// })

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const aTask = new Task({
//     description: '   Buy groceries from store    ',
// })

// aTask.save().then(() => {
//     console.log('Success!', aTask)
// }).catch((error) => {
//     console.log('Error!', error)
// })