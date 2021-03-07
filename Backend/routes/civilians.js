const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')
const { fill } = require('mysql2/lib/constants/charset_encodings')
const { Permission } = require('../permissions')
const Validators = require('../validators')
const Shared = require('../shared')



const CAD = Shared.CAD

const DATE_OF_BIRTH = new RegExp(`^(0[1-9]|1[0-2])\\/(0[1-9]|1\\d|2\\d|3[0-1])\\/(1900|19\\d{2}|200[0-3])$`)

router.post('/civilians/list', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.Civilian, async (req, res) => {
    const data = await CAD.query(`SELECT * FROM civilians WHERE member_id = ? and community_id = ?`, [req.member, req.community])
    res.status(200).json(data[0])
})

router.post('/civilians/add', middleware.LoggedInMember, middleware.ProvideCommunity, middleware.GetPlanRestrictions, Permission.Civilian, async (req, res) => {
    
    let civCount = await CAD.query(`SELECT COUNT(id) AS civCount FROM civilians WHERE community_id = ? AND member_id = ?`, [req.community, req.member])
    civCount = civCount[0][0].civCount

    if (civCount >= req.restrictions.civilians && req.restrictions.civilians != -1) {
        res.status(401).send(`You may only register ${req.restrictions.civilians} civilians with your current plan!`)
        return
    }
    
    const values = {
        'first_name': req.body.first_name,
        'last_name': req.body.last_name,
        'middle_initial': req.body.middle_initial,
        'date_of_birth': req.body.date_of_birth,
        'place_of_residence': req.body.place_of_residence,
        'zip_code': req.body.zip_code,
        'occupation': req.body.occupation,
        'height': req.body.height,
        'weight': req.body.weight,
        'hair_color': req.body.hair_color,
        'eye_color': req.body.eye_color,
        'license_type': req.body.license_type,
        'license_expiration': req.body.license_expiration,
        'license_status': req.body.license_status
    }

    // Stop if Validation Fails
    const valid = await Validators.ValidateCivilian(res, values)
    if (!valid) return

    let propertiesToChange = ['community_id', 'member_id']
    let fill_values = [req.community, req.member]
    for (let key in values) {
        if (values[key]) {
            propertiesToChange[propertiesToChange.length] = key
            fill_values[fill_values.length] = mysql.escape(values[key])
        }
    }

    await CAD.query(
        `INSERT INTO civilians (${propertiesToChange.join(', ')}) VALUES (${fill_values.join(', ')})`
    )

    res.status(201).send('Civilian Created!')
})

router.post('/civilians/edit', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.Civilian, async (req, res) => {
    const civilianID = req.body.civilian_id
    if (!civilianID) {
        res.status(400).send('You must provide a civilian ID.')
        return
    }

    const ValuesToChange = {
        'first_name': req.body.first_name,
        'last_name': req.body.last_name,
        'middle_initial': req.body.middle_initial,
        'date_of_birth': req.body.date_of_birth,
        'place_of_residence': req.body.place_of_residence,
        'zip_code': req.body.zip_code,
        'occupation': req.body.occupation,
        'height': req.body.height,
        'weight':req.body.weight,
        'hair_color': req.body.hair_color,
        'eye_color': req.body.eye_color,
        'license_type': req.body.license_type,
        'license_expiration': req.body.license_expiration,
        'license_status': req.body.license_status
    }

    // Stop if Validation Fails
    const valid = await Validators.ValidateCivilian(res, ValuesToChange)
    if (!valid) return

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {
            CAD.query(
                `UPDATE civilians SET ${key} = ? WHERE id = ? AND community_id = ? AND member_id = ?`,
                [ValuesToChange[key], civilianID, req.community, req.member]
            )
        }
    }

    res.status(200).send('Updating civilian!')
})

router.post('/civilians/delete', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.Civilian, async (req, res) => {
    const civilianID = req.body.civilian_id
    if (!civilianID) {
        res.status(400).send('You must provide a civilian ID.')
        return
    }

    const member = await CAD.query(`SELECT id FROM civilians WHERE id = ? AND community_id = ? AND member_id = ?`, [civilianID, req.community, req.member])
    if (member[0].length) {
        CAD.query(`DELETE FROM civilians WHERE id = ? AND community_id = ? AND member_id = ?`, [civilianID, req.community, req.member])
        CAD.query(`DELETE FROM vehicles WHERE civilian_id = ?`, [civilianID])
        CAD.query(`DELETE FROM firearms WHERE civilian_id = ?`, [civilianID])
        res.status(200).send('Civilian and all data removed!')
        return
    }

    res.status(400).send('Unable to find a civilian with the data provided.')
})

module.exports = {}
module.exports.civilianRoutes = router