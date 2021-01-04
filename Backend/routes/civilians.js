const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')
const { fill } = require('mysql2/lib/constants/charset_encodings')





const CAD = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    database: 'cad',
}).promise()

const DATE_OF_BIRTH = new RegExp(`^(0[1-9]|1[0-2])\\/(0[1-9]|1\\d|2\\d|3[0-1])\\/(1900|19\\d{2}|200[0-3])$`)

router.post('/civilians/list', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {
    const data = await CAD.query(`SELECT * FROM civilians WHERE member_id = ? and community_id = ?`, [req.member, req.community])
    res.status(200).json(data[0])
})

// router.post('/civilians/add', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {

//     const firstName = req.body.first_name
//     const lastName = req.body.last_name
//     const dob = req.body.date_of_birth
    
//     if (!firstName || !lastName || !dob) {
//         res.status(400).send('The required data was not provided.')
//         return
//     }

//     if (!DATE_OF_BIRTH.test(dob)) {
//         res.status(400).send('Provide a valid date of birth such as 02/23/1997.')
//         return
//     }

//     const communityPlan = (await CAD.query(`SELECT plan FROM communities WHERE id = ?`, [req.community]))[0][0].plan
    
//     let maxPerPlayer = 2
//     switch (communityPlan) {
//         case 1:
//             maxPerPlayer = 4
//             break
//         case 2:
//             maxPerPlayer = 8
//             break
//         case 3:
//             maxPerPlayer = null
//             break
//     }

//     const data = await CAD.query(`SELECT * FROM civilians WHERE member_id = ? and community_id = ?`, [req.member, req.community])
//     if (data[0].length >= maxPerPlayer && maxPerPlayer) {
//         res.status(403).send(`You may register no more than ${maxPerPlayer} civilians.`)
//         return
//     }
    
//     await CAD.query(
//         `INSERT INTO civilians (community_id, member_id, first_name, last_name, date_of_birth) VALUES (?, ?, ?, ?, ?)`, 
//         [req.community, req.member, firstName, lastName, dob]
//     )
//     res.status(201).send('Civilian created!')

// })

router.post('/civilians/add', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {

    const values = {
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

    if (!values.first_name || !values.last_name || !values.date_of_birth) {
        res.status(400).send('You must at least provide a full name and date of birth.')
        return
    }

    if (!DATE_OF_BIRTH.test(values.date_of_birth)) {
        res.status(400).send('Provide a valid date of birth such as 02/23/1997.')
        return
    }

    let propertiesToChange = ['community_id', 'member_id']
    let fill_values = [req.community, req.member]
    for (let key in values) {
        if (values[key]) {
            propertiesToChange[propertiesToChange.length] = key
            fill_values[fill_values.length] = mysql.escape(values[key])
        }
    }

    console.log(`INSERT INTO civilians (${propertiesToChange.join(', ')}) VALUES (${fill_values.join(', ')})`)

    await CAD.query(
        `INSERT INTO civilians (${propertiesToChange.join(', ')}) VALUES (${fill_values.join(', ')})`
    )

    res.status(201).send('Civilian Created!')

})

router.post('/civilians/edit', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {

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

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {
            if (key == 'date_of_birth') {
                if (!DATE_OF_BIRTH.test(ValuesToChange[key])) {
                    res.status(400).send('Provide a valid date of birth such as 02/23/1997.')
                    return
                }
            }

            CAD.query(
                `UPDATE civilians SET ${key} = ? WHERE id = ? AND community_id = ? AND member_id = ?`,
                [ValuesToChange[key], civilianID, req.community, req.member]
            )
        }
    }

    res.status(200).send('Updating civilian!')

})

router.post('/civilians/delete', middleware.LoggedInMember, middleware.ProvideCommunity, async (req, res) => {
    const civilianID = req.body.civilian_id
    if (!civilianID) {
        res.status(400).send('You must provide a civilian ID.')
        return
    }

    await CAD.query(`DELETE FROM civilians WHERE id = ? AND community_id = ? AND member_id = ?`, [civilianID, req.community, req.member])
    res.status(200).send('Civilian removed!')
})

module.exports = {}
module.exports.civilianRoutes = router