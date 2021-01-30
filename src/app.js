const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
//const port = process.env.PORT //because we are not listening in here

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app

//
// Without middleware: new request -> run route handler
//
// With middleware: new request -> do something -> run route handler
//// doSomething could be something like check if the request has an authentication token and validating it
//
// app.use( (req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }

// })

//Midldeware for when site is in maintenence mode. Because we didn't call next(), the requests will not proceed
// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back later')
// })
