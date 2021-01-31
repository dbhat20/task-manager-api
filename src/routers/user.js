const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user')
const auth = require('../middleware/auth')  //we need auth only for certain routers not all, so instead of index.js put it here
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail , sendCancellationEmail } = require('../emails/account')
const router = new express.Router()

// REST API - Create User in user DB
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// REST API - Find user by credentials (email/pw)
router.post('/users/login', async (req, res) => {
    try {
        //findByCredentials works on the User collection
        const user = await User.findByCredentials(req.body.email, req.body.password)
         // token will live on user instance, generated for that user
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//REST API - Allow a user to logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    } catch(e) {
        res.status(500).send()
    }
})

//REST API - Logout of all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch(e) {
        res.status(500).send()
    }
})
// REST API - Read all Users from user DB
//This is not a useful REST API because we dont want a user to be able to get all users of our app
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

// REST API - Read your profile
router.get('/users/me', auth, async (req, res) => {
      try{
        res.send(req.user)  //since user was added to req, no need to find the user again. Just use req.user
      } catch (e) {
          res.status(500).send(e)
      }
})
// REST API - Read an User from user DB - NOT A USEFUL API
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send({ error: 'Not a valid ID' });
    }
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send({ error: 'The given user was not found!' })
        }
        res.send(user)

    } catch (e) {
        res.status(500).send(e)
    }

})

// REST API - Update your information
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email','password', 'age']
    const isValidOperation = updates.every( (update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Operation'})
    }
    
    try {
        // For middleware to run you need save instead of findByIdAndUpdate
        updates.forEach( (update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send({ error: ' Not a valid update' })
    }
})

// REST API - Delete an User from user DB
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        //await sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// REST API - End point for avatar image upload
// POST /users/me/avatar
const upload = multer({
    //dest: 'avatars', //folder name to store pics
    limits: {
        fileSize: 1000000
    },
    fileFilter: function(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a JPEG, JPG, or PNG image'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('uploadVar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    //req.user.avatar = req.file.buffer //remove dest from multer so that multer doesn't store the file but pass it through to the function
    req.user.avatar = buffer
    //console.log('Buffer:', buffer)
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

// REST API end point to delete your avatar
// DELETE /users/me/avatar
router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
})

// REST API end point to get the avatar so we can view it in an html
// http://localhost:3000/users/{id}/avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

// // REST API - Update an User from user DB
// router.patch('/users/:id', async (req, res) => {

//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email','password', 'age']
//     const isValidOperation = updates.every( (update) => allowedUpdates.includes(update))

//     // const isValidOperation = updates.every( (update) => {
//     //     return allowedUpdates.includes(update)
//     // })
//     const _id = req.params.id

//     if (!isValidOperation) {
//         return res.status(400).send({error: 'Invalid Operation'})
//     }
//     if (!mongoose.isValidObjectId(_id)) {
//         return res.status(404).send({ error: 'Not a valid ID' });
//     }
//     try {

//         // For middleware to run you need save instead of findByIdAndUpdate
//         const user = await User.findById (req.params.id)
//         updates.forEach( (update) => {
//             user[update] = req.body[update]
//         })
//         await user.save()

//         //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
//         if (!user) {
//             return res.status(404).send({ error: 'The given user was not found!' })
//         }
//         res.send(user)

//     } catch (e) {
//         res.status(400).send({ error: ' Not a valid update' })
//     }
// })


module.exports = router