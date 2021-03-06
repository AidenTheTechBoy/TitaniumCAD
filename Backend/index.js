//Config for .env Files
require('dotenv').config()

//Imports
//const eventLoopStats = require('event-loop-stats')
const rateLimit = require('express-rate-limit')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const app = express()

//Active Status Monitor
app.use(require('express-status-monitor')())

//Serve Static Directory
app.use('/static', express.static(__dirname.replace(/\\/g, '/') + `/routes/public`))

//Setup JSON Body Parser
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))

//Setup Cors
app.use(cors())

// 10 req / 5 second
app.use("/", rateLimit({
    windowMs: 1000,
    max: 5
}))

// 200 req / 5 min
app.use("/", rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000
}))

// 10000 req / 1 Day
app.use("/", rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10000
}))

// User Authentication
const { authRoutes } = require('./routes/authentication')
app.use('/', authRoutes)

// Community Management
const { communityRoutes } = require('./routes/communities')
app.use('/', communityRoutes)

// Civilian Routes
const { civilianRoutes } = require('./routes/civilians')
app.use('/', civilianRoutes)

// DMV Routes
const { dmvRoutes } = require('./routes/dmv')
app.use('/', dmvRoutes)

// Firearm Routes
const { firearmRoutes } = require('./routes/firearms')
app.use('/', firearmRoutes)

const { settingsRoutes } = require('./routes/settings')
app.use('/', settingsRoutes)

const { cadRoutes } = require('./routes/cad')
app.use('/cad', cadRoutes)

const { paymentRoutes } = require('./routes/payments')
app.use('/payments', paymentRoutes)

const { apiRoutes } = require('./routes/api')
app.use('/api', apiRoutes)

const { uploadRoutes } = require('./routes/upload')
app.use('/upload', uploadRoutes)

app.listen(5000, () => {
    console.log('API online. Awaiting Requests...')
})