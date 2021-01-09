//Imports
const { Permission } = require('../permissions')
const router = require('express').Router()
const middleware = require('../middleware')
const multer = require("multer")
const sharp = require("sharp")
const path = require('path')

//Create Storage
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img')
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        cb(null, `community-${req.community}.${ext}`);
    }
})

//Create Filter
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        return
    }
}

//Declare Upload
const upload = multer({
    fileFilter: multerFilter
})

//Middleware to Pull Information
const PullSenderInfo = async function (req, res, next) {
    req.body = {
        'cookie': req.headers['titanium-cookie'],
        'access_code': req.headers['titanium-access-code']
    }
    next()
}

//Server-Icon Request
router.post('/server-icon', PullSenderInfo, middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageSettings, upload.single('server_icon'), async function (req, res) {
    await sharp(req.file.buffer)
        .resize(512, 512)
        .toFormat('png')
        .toFile(__dirname.replace(/\\/g, '/') + `/public/img/community-${req.community}.png`)
    res.status(200).send('Server icon successfully changed!')
})

//Exports
module.exports = {}
module.exports.uploadRoutes = router