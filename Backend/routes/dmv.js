const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')
const { Permission } = require('../permissions')



const CAD = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    database: 'cad',
}).promise()

const DATE_OF_BIRTH = new RegExp(`^(0[1-9]|1[0-2])\\/(0[1-9]|1\\d|2\\d|3[0-1])\\/(1900|19\\d{2}|200[0-3])$`)

router.post('/dmv/list', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, Permission.Civilian, async (req, res) => {
    const data = await CAD.query(`SELECT * FROM vehicles WHERE civilian_id = ? AND community_id = ?`, [req.civilian, req.community])
    res.status(200).json(data[0])
})

router.post('/dmv/add', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, Permission.Civilian, async (req, res) => {
    const plate = req.body.plate
    const color = req.body.color
    const make = req.body.make
    const model = req.body.model
    const year = req.body.year
    const registration = req.body.registration
    const insurance = req.body.insurance
    
    if (!plate || !color || !make || !model || !year || !registration || !insurance) {
        res.status(400).send('The required data was not provided.')
        return
    }

    //TODO: Verify valid color/make/model/year/registration/insurance 
    
    CAD.query(
        `INSERT INTO vehicles (community_id, civilian_id, plate, color, make, model, year, registration, insurance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [req.community, req.civilian, plate, color, make, model, year, registration, insurance]
    )
    res.status(201).send('Vehicle added!')
})

router.post('/dmv/edit', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, Permission.Civilian, async (req, res) => {
    const vehicleID = req.body.vehicle_id
    if (!vehicleID) {
        res.status(400).send('You must provide a vehicle ID.')
        return
    }

    const ValuesToChange = {
        'color': req.body.color,
        'plate': req.body.plate,
        'make': req.body.make,
        'model': req.body.model,
        'year': req.body.year,
        'registration': req.body.registration,
        'insurance': req.body.insurance,
    }

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {
            
            //TODO: Validate Values

            CAD.query(
                `UPDATE vehicles SET ${key} = ? WHERE id = ? AND community_id = ? AND civilian_id = ?`,
                [ValuesToChange[key], vehicleID, req.community, req.civilian]
            )
        }
    }

    res.status(200).send('Updating vehicle!')
})

router.post('/dmv/delete', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.ProvideCivilianAuth, Permission.Civilian, async (req, res) => {
    const vehicleID = req.body.vehicle_id
    if (!vehicleID) {
        res.status(400).send('You must provide a vehicle ID.')
        return
    }

    await CAD.query(`DELETE FROM vehicles WHERE id = ? AND community_id = ? AND civilian_id = ?`, [vehicleID, req.community, req.civilian])
    res.status(200).send('Vehicle removed!')
})

module.exports = {}
module.exports.dmvRoutes = router