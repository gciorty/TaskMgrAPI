const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')
const router = new express.Router()

const avatarUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Pleae upload an image'))
        }
        cb(undefined, true)
    }
})

// POST
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.genAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.genAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

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

router.post('/users/logoutall', auth, async (req,res) => {
    try { 
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e){
        res.status(500).send()
    }
})

router.post('/users/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    const bufferImg = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = bufferImg
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) =>{
    res.status(400).send({
        error: error.message
    })
})

// GET
router.get('/users/me', auth, async (req, res) => {
     res.send(req.user)
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar){
            return new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.send(404).send()
    }
})
// PATCH
router.patch('/users/me', auth, async(req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({error: 'Not valid field'})
    } 

    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()        
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// DELETE
router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router