const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// REST API - Create a Task in task DB
router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body, //es6 spread operator to copy all the stuff from req.body
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send({ error: 'Could not create the task!' })
    }
})

// REST API - Read all Tasks from tasks DB
//  GET /tasks?completed=true to filter only completed tasks
// GET /tasks?limit=10&skip=10 for pagination
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    
    try {
        //const tasks = await Task.find({owner: req.user._id})
        //await req.user.populate('taskList').execPopulate()
        await req.user.populate({
            path: 'taskList',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(201).send(req.user.taskList)
    } catch (e) {
        res.status(500).send(e)
    }
})

// REST API - Read a Task from tasks DB
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send({ error: 'Not a valid ID' });
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id})
        
        if (!task) {
            return res.status(404).send({ error: 'The given task was not found!' })
        }

        res.status(201).send(task)

    } catch (e) {
        res.status(500).send(e)
    }
})

// REST API - Update a Task from tasks DB
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every( (update) => allowedUpdates.includes(update))

    const _id = req.params.id

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Operation'})
    }

    if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send({ error: 'Not a valid ID' });
    }
    try {
        // For middleware to run you need save instead of findByIdAndUpdate
        const task = await Task.findOne({ _id, owner: req.user._id})
        
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        if (!task) {
            return res.status(404).send({ error: 'The given task was not found!' })
        }
        updates.forEach( (update) => task[update] = req.body[update])
        await task.save()
        res.status(201).send(task)

    } catch (e) {
        res.status(500).send(e)
    }
})

// REST API - Delete an Task from tasks DB
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router