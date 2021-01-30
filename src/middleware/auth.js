const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req, res, next) => {   
    try {
        //looks for header, validates header and finds corresponding user
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user // you already fetched the user so add it to req so that it does not have to be fetched again in the route handler
        next()

    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

module.exports = auth