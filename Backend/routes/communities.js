const router = require('express').Router()

const mysql = require('mysql2')
const authentication = require('./authentication')
const middleware = require('../middleware')
const { request } = require('express')
const crypto = require('crypto-random-string')



const CAD = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    database: 'cad',
}).promise()

router.post('/communities/check', async(req, res) => {
    const communities = await CAD.query(`SELECT name, access_code, status FROM communities WHERE access_code = ?`, [req.body.access_code])
    if (communities[0]) {
        res.status(200).json(communities[0])
        return
    }
    res.status(400).send('Community could not be found.')
})

router.post('/communities/list', middleware.LoggedInUser, async(req, res) => {
    const communities = await CAD.query(`SELECT id, name, access_code, plan, status FROM communities WHERE user_id = ?`, [req.user])
    res.status(200).json(communities[0])
})

router.post('/communities/create', middleware.LoggedInUser, async (req, res) => {

    let CommunityName = req.body.name
    let AccessCode = req.body.access_code

    if (CommunityName) {
        CommunityName = CommunityName.trim()
    }

    if (AccessCode) {
        AccessCode = AccessCode.toLowerCase().trim()
    }

    if (!CommunityName || !AccessCode) {
        res.status(400).send('Please provide a name and access code')
        return
    }

    let results

    //Max Three communities Per Player
    results = await CAD.query(`SELECT id FROM communities WHERE user_id = ?`, [req.user])
    if (results[0].length >= 3) {
        res.status(403).send('You may create no more than three communities!')
        return
    }

    //Unique Access Code
    results = await CAD.query(`SELECT id FROM communities WHERE access_code = ?`, [AccessCode])
    if (results[0].length > 0) {
        res.status(400).send('Please specify a unique access code!')
        return
    }

    //Create Community
    await CAD.query(
        `INSERT INTO communities (name, user_id, access_code, plan, status) VALUES (?, ?, ?, ?, ?)`,
        [CommunityName, req.user, AccessCode, 0, 'active']
    )

    let requests
    requests = await CAD.query(
        `SELECT id FROM communities WHERE access_code = ?`, [AccessCode]
    )
    const CommunityID = requests[0][0].id

    requests = await CAD.query(
        `SELECT email, username, password FROM users WHERE id = ?`, [req.user]
    )
    const userInfo = requests[0][0]

    //Create Owner as Member
    await CAD.query(`INSERT INTO members (community_id, email, username, password, verified, permission_manage_settings, permission_manage_servers, permission_manage_members, permission_manage_departments, permission_manage_codes, permission_civilian, permission_police_mdt, permission_fire_mdt, permission_dispatch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [CommunityID, userInfo.email, userInfo.username, userInfo.password, true, true, true, true, true, true, true, true, true, true, true])
    
    //Get Owner and Add Member as Owner
    const owner_member_id = (await CAD.query(`SELECT id FROM members WHERE community_id = ?`, [CommunityID]))[0][0].id
    await CAD.query(`UPDATE communities SET owner_member_id = ? WHERE id = ?`, [owner_member_id, CommunityID])
    
    //const memberID = (await CAD.query(`SELECT id FROM members WHERE email = ?`, [userInfo.email]))[0][0].id

    res.status(201).send('Community Created')

})

router.post('/communities/edit', middleware.LoggedInUser, middleware.ProvideCommunityID, async (req, res) => {

    const ValuesToChange = {
        'name': req.body.name,
        'access_code': req.body.access_code,
    }

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {

            if (key == 'access_code') {
                if ((await CAD.query(`SELECT id FROM communities WHERE access_code = ? AND id <> ?`, [ValuesToChange[key], req.community]))[0].length > 0) {
                    res.status(400).send('A community already exists with that access code!')
                    return
                }
            }

            CAD.query(
                `UPDATE communities SET ${key} = ? WHERE id = ? AND user_id = ?`,
                [ValuesToChange[key], req.community, req.user]
            )
        }
    }

    res.status(200).send('Updating community!')

})

router.post('/communities/delete', middleware.LoggedInUser, middleware.ProvideCommunityID, async (req, res) => {
    await CAD.query(`DELETE FROM communities WHERE id = ? AND user_id = ?`, [req.community, req.user])
    res.status(200).send('Community removed!')
})

module.exports = {}
module.exports.communityRoutes = router