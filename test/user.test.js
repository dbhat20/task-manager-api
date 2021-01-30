const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Mike",
    email: "mike@example.com",
    password: "56what!!",
    tokens: [{
        token: jwt.sign({ _id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Giselle',
        email: 'hello@example.com',
        password: 'HelloYellow()()'
    }).expect(201)

    //Assert that the db was changed corrrectly
    const user = await User.findById(response.body.user._id)
    //console.log('User:',response.body)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Giselle',
            email: 'hello@example.com'
        },
        token: user.tokens[0].token
    })

    //Password should not be saved as text
    expect(user.password).not.toBe('HelloYellow()()')
})

test('Should log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    //Validate that new token is saved
    const user = await User.findById(userOneId)
    const secondToken = response.body.token
   // console.log('userOne', user)
    //console.log('resp.body.token:', resp.body)
    expect(secondToken).toBe(user.tokens[1].token)

})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: "Wrong Name",
        password: userOne.password
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthorized user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Validate that user is removed
    user = await User.findById(userOneId)
    expect(user).toBeNull()
})

// test('Should not delete account for unauthorized user', async () => {
//     await request(app)
//         .delete('/users/me')
//         .send()
//         .expect(401)
// })

