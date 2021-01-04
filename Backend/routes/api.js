const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')

const CAD = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    database: 'cad',
}).promise()

router.post('/units', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {

    

})

module.exports = {}
module.exports.apiRoutes = router