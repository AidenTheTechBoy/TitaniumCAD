const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')
const Shared = require('../shared')

const CAD = Shared.CAD

router.post('/units', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {

    

})

module.exports = {}
module.exports.apiRoutes = router