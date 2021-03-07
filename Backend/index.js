//Config for .env Files
require('dotenv').config()

//Imports
const rateLimit = require('express-rate-limit')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const app = express()

//IP Recording
const expressip = require('express-ip');
app.use(expressip().getIpInfoMiddleware);

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

// 4 req / 2 second
app.use("/", rateLimit({
    windowMs: 2000,
    max: 3,
    message: 'You are sending requests too quickly! Slow down!'
}))

// 15 req / 10 second
app.use("/", rateLimit({
    windowMs: 10000,
    max: 15,
    message: 'You are sending requests too quickly! Slow down!'
}))

// 100 req / 1 min
app.use("/", rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    message: 'You are sending requests too quickly! Wait one minute!'
}))

// 30000 req / 1 Day
app.use("/", rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 30000,
    message: 'You hit the daily request limit, you will need to wait 24 hours to try again.'
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