const router = require('express').Router()

const mysql = require('mysql2')
const middleware = require('../middleware')
const { CheckPermissions, Permission, PermissionsArray } = require('../permissions')
const { CAD } = require('../shared')



router.post('/add-unit', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        const ingame_id = req.body.ingame_id
        const name = req.body.name
        const callsign = req.body.callsign

        if (!ingame_id || !name || !callsign) {
            res.status(400).send('You must provide your in-game ID, callsign, and name!')
            return
        }

        //Remove Any Other Units by Member
        await CAD.query(`DELETE FROM units WHERE member_id = ?`, [req.member])
        
        //Add Unit to CAD
        await CAD.query(`INSERT INTO units (server_id, member_id, ingame_id, callsign, name, status, last_update) VALUES (?, ?, ?, ?, ?, ?, ?)`, [req.server, req.member, ingame_id, callsign, name, 'AVAILABLE', Date.now()])

        res.status(201).send('Unit added to database!')
    }
})

router.post('/assign-unit', middleware.LoggedInMember, middleware.ProvideServerID, Permission.Dispatch, async (req, res) => {

    const member_id = req.body.member_id
    if (!member_id) {
        res.status(400).send('A unit must be specified!')
        return
    }

    const call_id = req.body.call_id

    CAD.query(`UPDATE units SET current_call = ? WHERE member_id = ? AND server_id = ?`, [call_id, member_id, req.server])


    res.status(200).send('Unit assigned to call!')

})

router.post('/unit-status', middleware.LoggedInMember, middleware.ProvideServerID, Permission.Dispatch, async (req, res) => {

    const member_id = req.body.member_id
    if (!member_id) {
        res.status(400).send('A unit must be specified!')
        return
    }

    const status = req.body.status

    CAD.query(`UPDATE units SET status = ? WHERE member_id = ? AND server_id = ?`, [status, member_id, req.server])


    res.status(200).send('Unit status changed!')

})

router.post('/self-status', middleware.LoggedInMember, middleware.ProvideServerID, Permission.Police, async (req, res) => {
    if (await PermissionsArray(req, res, ['POLICE', 'FIRE'])) {
        const status = req.body.status

        if (!['AVAILABLE', 'UNAVAILABLE', 'BUSY', 'ENROUTE', 'ONSCENE', 'PANIC'].includes(status)) {
            res.status(400).send('A valid status must be provided.')
            return
        }

        CAD.query(`UPDATE units SET status = ? WHERE member_id = ? AND server_id = ?`, [status, req.member, req.server])

        res.status(200).send('Self status changed!')
    }
})

router.post('/my-status', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {
    if (await PermissionsArray(req, res, ['POLICE', 'FIRE'])) {
        const data = await CAD.query(`SELECT current_call, callsign, name, location, status FROM units WHERE server_id = ? AND member_id = ?`, [req.server, req.member])

        if (data[0].length) {
            res.status(200).json(data[0][0])
            return
        }
        
        res.status(500).send('Unable to fetch status data! Unit not assigned?')
    }
})

router.post('/calls', middleware.LoggedInMember, middleware.ProvideServerID, Permission.Dispatch, async (req, res) => {
    const call_id = req.body.call_id
    const call_info = {
        title: req.body.title,
        origin: req.body.origin,
        status: req.body.status,
        priority: req.body.priority,
        code: req.body.code,
        primary: req.body.primary,
        address: req.body.address,
        postal: req.body.postal,
    }

    let meetsRequirement = false
    for (let dataKey in call_info) {
        if (call_info[dataKey]) {
            meetsRequirement = true
        }
    }

    if (!meetsRequirement) {
        res.status(400).send('You must provide at least field of data for the call.')
        return
    }

    if (call_id) {
        for (let key in call_info) {
            if (call_info[key]) {
                CAD.query(`UPDATE calls SET \`${key}\` = ? WHERE id = ? AND server_id = ?`, [call_info[key], call_id, req.server])
            } else {
                CAD.query(`UPDATE calls SET \`${key}\` = NULL WHERE id = ? AND server_id = ?`, [call_id, req.server])
            }  
        }

        res.status(200).send('Call Updated!')
        return
    }

    CAD.query(
        `INSERT INTO calls (server_id, title, origin, status, priority, code, \`primary\`, address, postal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.server, call_info.title, call_info.origin, call_info.status, call_info.priority, call_info.code, call_info.primary, call_info.location, call_info.postal]
    )

    res.status(201).send('Call Created!')
})

router.post('/deletecall', middleware.LoggedInMember, middleware.ProvideServerID, Permission.Dispatch, async (req, res) => {
    let call_id = req.body.call_id

    CAD.query(`DELETE FROM calls WHERE id = ? AND server_id = ?`, [call_id, req.server])

    res.status(200).send('Call Removed')
})

router.post('/bolo', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        const bolo_id = req.body.bolo_id
        const bolo_info = {
            plate: req.body.plate,
            vehicle: req.body.vehicle,
            charges: req.body.charges,
            flags: req.body.flags
        }

        if (!bolo_info.vehicle) {
            res.status(400).send('You must provide a vehicle description.')
            return
        }
        
        if (bolo_id) {
            for (let key in bolo_info) {
                if (bolo_info[key]) {
                    CAD.query(`UPDATE bolos SET \`${key}\` = ? WHERE id = ? AND server_id = ?`, [bolo_info[key], bolo_id, req.server])
                } else {
                    CAD.query(`UPDATE bolos SET \`${key}\` = NULL WHERE id = ? AND server_id = ?`, [bolo_id, req.server])
                }  
            }

            res.status(200).send('Bolo Updated!')
            return
        }

        CAD.query(
            `INSERT INTO bolos (server_id, plate, vehicle, charges, flags) VALUES (?, ?, ?, ?, ?)`,
            [req.server, bolo_info.plate, bolo_info.vehicle, bolo_info.charges, bolo_info.flags]
        )

        res.status(201).send('Bolo Created!')
    }
})

router.post('/deletebolo', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        let bolo_id = req.body.bolo_id

        CAD.query(`DELETE FROM bolos WHERE id = ? AND server_id = ?`, [bolo_id, req.server])

        res.status(200).send('Bolo Removed')
    }
})

router.post('/current', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        const community_id = (await CAD.query(`SELECT community_id FROM servers WHERE id = ?`, [req.server]))[0][0].community_id

        const calls = await CAD.query(`SELECT * FROM calls WHERE server_id = ? ORDER BY id DESC`, [req.server])
        const units = await CAD.query(`SELECT * FROM units WHERE server_id = ?`, [req.server])
        const bolos = await CAD.query(`SELECT * FROM bolos WHERE server_id = ?`, [req.server])
        const emergency_calls = await CAD.query(`SELECT * FROM \`911\` WHERE server_id = ?`, [req.server])
        const codes = await CAD.query(`SELECT * FROM codes WHERE community_id = ?`, [community_id])

        
        for (let i in calls[0]) {
            calls[0][i].units = []

            let call = calls[0][i]
            for (let x in units[0]) {

                let unit = units[0][x]
                if (unit.current_call == call.id) {
                    calls[0][i].units[calls[0][i].units.length] = unit.callsign
                }

            }

        }

        res.status(200).send({
            'calls': calls[0],
            'units': units[0],
            'bolos' : bolos[0],
            '911': emergency_calls[0],
            'codes': codes[0],
            'signal': signals[req.server]
        })
    }
})

router.post('/911', async (req, res) => {
    const secret = req.body.secret
    const caller = req.body.caller
    const details = req.body.details
    const address = req.body.address
    if (!secret | !caller || !details || !address) {
        res.status(400).send('The required data was not provided.')
        return
    }

    
    const results = await CAD.query(`SELECT id FROM servers WHERE secret = ?`, [secret])
    if (results[0].length == 0) {
        res.status(400).send('No server was found with that secret.')
        return
    }

    const server_id = results[0][0].id

    CAD.query(
        `INSERT INTO \`911\` (server_id, caller, details, address, timestamp, active) VALUES (?, ?, ?, ?, ?, ?)`,
        [server_id, caller, details, address, Date.now(), true]
    )

    res.status(201).send('Call sent to 911 operators!')
})

router.post('/del911', middleware.LoggedInMember, middleware.ProvideServerID, Permission.Dispatch, async (req, res) => {

    const call911_id = req.body.call911_id
    if (!call911_id) {
        res.status(400).send('A call must be specified!')
        return
    }

    CAD.query(`DELETE FROM \`911\` WHERE id = ? AND server_id = ?`, [call911_id, req.server])

    res.status(200).send('Call Removed!')

})

router.post('/get-servers', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {
    if (await PermissionsArray(req, res, ['MANAGE_SERVERS', 'DISPATCH', 'POLICE', 'FIRE'])) {
        let results = await CAD.query(`SELECT id, name FROM servers WHERE community_id = ?`, [req.community])
        res.status(200).json(results[0])
    }
})

router.post('/get-codes', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {
    if (await PermissionsArray(req, res, ['MANAGE_CODES', 'DISPATCH', 'POLICE', 'FIRE'])) {
        let results = await CAD.query(`SELECT * FROM codes WHERE community_id = ? ORDER BY code`, [req.community])
        res.status(200).json(results[0])
    }
})

router.post('/lookup-person', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        let firstName = req.body.first_name
        let lastName = req.body.last_name
        let dateOfBirth = req.body.date_of_birth

        if (!firstName && !lastName && !dateOfBirth) {
            res.status(200).json([])
            return
        }

        let query = `SELECT * FROM civilians WHERE community_id = ? AND (`

        let args = []
        if (firstName) {
            args[args.length] = `first_name LIKE ${mysql.escape(firstName.replace(/%/g) + '%')}`
        }
        if (lastName) {
            args[args.length] = `last_name LIKE ${mysql.escape(lastName.replace(/%/g) + '%')}`
        }
        if (dateOfBirth) {
            args[args.length] = `date_of_birth = ${mysql.escape(dateOfBirth)}`
        }

        query += args.join(' AND ') + `)`

        let results = await CAD.query(query, [req.community])
        res.status(200).json(results[0])
    }
})

router.post('/lookup-vehicle', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        let plate = req.body.plate
        let color = req.body.color
        let make = req.body.make
        let model = req.body.model
        let year = req.body.year

        if (!plate && !color && !make && !model && !year) {
            res.status(200).json([])
            return
        }

        let query = `SELECT * FROM vehicles WHERE community_id = ? AND (`

        let args = []
        if (plate) {
            args[args.length] = `plate = ${mysql.escape(plate)}`
        }
        if (color) {
            args[args.length] = `color = ${mysql.escape(color)}`
        }
        if (make) {
            args[args.length] = `make = ${mysql.escape(make)}`
        }
        if (model) {
            args[args.length] = `model = ${mysql.escape(model)}`
        }
        if (year) {
            args[args.length] = `year = ${mysql.escape(year)}`
        }

        query += args.join(' AND ') + `)`

        let results = await CAD.query(query, [req.community])
        results = results[0]
        
        let finishedResults = []
        for (const i in results) {
            const civilian = await CAD.query(`SELECT * FROM civilians WHERE id = ?`, [results[i].civilian_id])
            if (civilian[0][0]) {
                results[i].civilian = civilian[0][0]
                finishedResults[finishedResults.length] = results[i]
            }
        }

        res.status(200).json(finishedResults)
    }
})

// Signal Code Manager
let signals = {}
router.post('/signal', middleware.LoggedInMember, middleware.ProvideServerID, async (req, res) => {
    if (await PermissionsArray(req, res, ['DISPATCH', 'POLICE', 'FIRE'])) {
        let signal = req.body.signal
        if (!signal || !isNaN(signal)) {

            //Add Server if It Does Not Exist
            // if (!signals[req.server]) signals[req.server] = {}

            //Set Signal
            signals[req.server] = signal

            res.status(200)
            res.send('Signal code activated!')

            return
        }

        res.status(400).send('Invalid signal code!')
    }
})

module.exports = {}
module.exports.cadRoutes = router