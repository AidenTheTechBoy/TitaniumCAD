const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')



const CAD = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    database: 'cad',
}).promise()

const DATE_OF_BIRTH = new RegExp(`^(0[1-9]|1[0-2])\\/(0[1-9]|1\\d|2\\d|3[0-1])\\/(1900|19\\d{2}|200[0-3])$`)

router.post('/firearms/list', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, async (req, res) => {
    const data = await CAD.query(`SELECT * FROM firearms WHERE civilian_id = ? AND community_id = ?`, [req.civilian, req.community])
    res.status(200).json(data[0])
})

router.post('/firearms/add', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, async (req, res) => {

    const name = req.body.name
    const registration = req.body.registration
    
    if (!name || !registration) {
        res.status(400).send('The required data was not provided.')
        return
    }

    //TODO: Verify valid name and registration
    
    CAD.query(
        `INSERT INTO firearms (community_id, civilian_id, name, registration) VALUES (?, ?, ?, ?)`, 
        [req.community, req.civilian, name, registration]
    )
    res.status(201).send('Firearm added!')

})

router.post('/firearms/edit', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, async (req, res) => {

    const firearmID = req.body.firearm_id
    if (!firearmID) {
        res.status(400).send('You must provide a firearm ID.')
        return
    }

    const ValuesToChange = {
        'name': req.body.name,
        'registration': req.body.registration,
    }

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {
            
            //TODO: Validate Values

            CAD.query(
                `UPDATE firearms SET ${key} = ? WHERE id = ? AND community_id = ? AND civilian_id = ?`,
                [ValuesToChange[key], firearmID, req.community, req.civilian]
            )
        }
    }

    res.status(200).send('Updating firearm!')

})

router.post('/firearms/delete', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, async (req, res) => {
    const firearmID = req.body.firearm_id
    if (!firearmID) {
        res.status(400).send('You must provide a firearm ID.')
        return
    }

    await CAD.query(`DELETE FROM firearms WHERE id = ? AND community_id = ? AND civilian_id = ?`, [firearmID, req.community, req.civilian])
    res.status(200).send('Firearm removed!')
})

module.exports = {}
module.exports.firearmRoutes = router