require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

const rateLimit = require('express-rate-limit')

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))

// 1000 req / 5 min
app.use("/", rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000
}))

// 10000 req / 1 Day
app.use("/", rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10000
}))

let num = 1
app.use("/", async function (req, res, next) {
    console.log(num + ' -> ' + req.originalUrl)
    num++
    next()
})

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

// var pidusage = require('pidusage')
// setInterval(() => {
//     pidusage(process.pid, function (err, stats) {
//         console.log(stats)
//     })
// }, 1000)

app.listen(5000, () => {
    console.log('API online. Awaiting Requests...')
})