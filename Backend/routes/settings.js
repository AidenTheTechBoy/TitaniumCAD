const router = require('express').Router()
const mysql = require('mysql2')
const Shared = require('../shared')
const Payments = require('../payments')
const middleware = require('../middleware')
const crypto = require('crypto-random-string')
const { Permission } = require('../permissions')

router.post('/my-permissions', middleware.LoggedInMember, middleware.ProvideCommunity, async(req, res) => {
    const permissions = await Shared.CAD.query(`SELECT permission_manage_settings, permission_manage_servers, permission_manage_members, permission_manage_departments, permission_manage_codes, permission_civilian, permission_police_mdt, permission_fire_mdt, permission_dispatch FROM members WHERE id = ?`, [req.member])
    res.status(200).json(permissions[0][0])
})

router.post('/dashboard', middleware.LoggedInMember, middleware.ProvideCommunity, async(req, res) => {
    const settings = await Shared.CAD.query(`SELECT dashboard_message FROM communities WHERE id = ?`, [req.community])
    res.status(200).json(settings[0][0])
})

router.post('/settings/get', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageSettings, async(req, res) => {
    const communities = await Shared.CAD.query(`SELECT * FROM communities WHERE id = ?`, [req.community])
    res.status(200).json(communities[0][0])
})

router.post('/settings/set', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageSettings, async(req, res) => {
    const ValuesToChange = {
        'public': req.body.public,
        'dashboard_message': req.body.dashboard_message,
        'webhook_global': req.body.webhook_global,
        'webhook_calls': req.body.webhook_calls,
        'code_available': req.body.code_available,
        'code_unavailable': req.body.code_unavailable,
        'code_busy': req.body.code_busy,
        'code_enroute': req.body.code_enroute,
        'code_onscene': req.body.code_onscene,
    }

    if (ValuesToChange['public']) {
        if (ValuesToChange['public'] != true) {
            res.status(400).send('Public setting must be true or false!')
        }
    }

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {
            Shared.CAD.query(
                `UPDATE communities SET ${key} = ? WHERE id = ?`,
                [ValuesToChange[key], req.community]
            )
        } else {
            Shared.CAD.query(
                `UPDATE communities SET ${key} = NULL WHERE id = ?`,
                [req.community]
            )
        }
    }

    res.status(200).send('Updating community!')
})

router.post('/settings/get-servers', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageServers, async(req, res) => {
    const communities = await Shared.CAD.query(`SELECT * FROM servers WHERE community_id = ?`, [req.community])
    res.status(200).json(communities[0])
})

router.post('/settings/regen-server-secret', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageServers, async(req, res) => {
    const id = req.body.id
    if (!id) {
        res.status(400).send('A valid server ID must be provided!')
        return
    }
    await Shared.CAD.query(`UPDATE servers SET secret = ? WHERE id = ? AND community_id = ?`, [crypto({length: 16}), id, req.community])
    res.status(200).send('Regenerated!')
})

router.post('/settings/add-server', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageServers, middleware.GetPlanRestrictions, async(req, res) => {
    //Check Max Server Count
    const SERVERS = await Shared.CAD.query(`SELECT * FROM servers WHERE community_id = ?`, [req.community])
    const COMMUNITY = await Shared.CAD.query(`SELECT plan FROM communities WHERE id = ?`, [req.community])
    const ALLOWED_SERVERS = req.restrictions.servers
    
    console.log(req.restrictions)
    
    if (SERVERS[0].length >= ALLOWED_SERVERS && ALLOWED_SERVERS != -1) {
        res.status(401).send(`You may only register ${ALLOWED_SERVERS} server(s) with your current pricing plan!`)
        return
    }

    const name = req.body.name
    const ip = req.body.ip

    if (!name || !ip) {
        res.status(400).send(`You must provide a name and ip address for the server!`)
        return
    }

    await Shared.CAD.query(`INSERT INTO servers (community_id, name, ip, secret) VALUES (?, ?, ?, ?)`, [req.community, name, ip, crypto({length: 16})])
    res.status(201).send('Server Created!')
})

router.post('/settings/edit-server', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageServers, async(req, res) => {
    const id = req.body.id
    if (!id) {
        res.status(400).send('A valid server ID must be provided!')
        return
    }

    const ValuesToChange = {
        'name': req.body.name,
        'ip': req.body.ip,
    }

    if (!ValuesToChange.name || !ValuesToChange.ip) {
        res.status(400).send(`You must provide a name and ip address for the server!`)
        return
    }

    for (let key in ValuesToChange) {
        if (ValuesToChange[key]) {
            Shared.CAD.query(
                `UPDATE servers SET ${key} = ? WHERE id = ? AND community_id = ?`,
                [ValuesToChange[key], id, req.community]
            )
        } else {
            Shared.CAD.query(
                `UPDATE servers SET ${key} = NULL WHERE id = ? AND community_id = ?`,
                [id, req.community]
            )
        }
    }

    res.status(200).send('Updating server!')
})

router.post('/settings/delete-server', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageServers, async(req, res) => {
    const id = req.body.id
    await Shared.CAD.query(`DELETE FROM servers WHERE id = ? AND community_id = ?`, [id, req.community])
    res.status(200).send('Deleted Server!')   
})

router.post('/settings/get-codes', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageCodes, async(req, res) => {
    const codes = await Shared.CAD.query(`SELECT * FROM codes WHERE community_id = ? ORDER BY code`, [req.community])
    res.status(200).json(codes[0])
})

router.post('/settings/add-code', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageCodes, async(req, res) => {
    const code = req.body.code
    const meaning = req.body.meaning
    if (!code || !meaning) {
        res.status(400).send('A valid code and description must be provided!')
        return
    }
    await Shared.CAD.query(`INSERT INTO codes (community_id, code, meaning) VALUES (?, ?, ?)`, [req.community, code, meaning])
    res.status(201).send('Created Code')   
})

router.post('/settings/delete-code', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageCodes, async(req, res) => {
    const id = req.body.id
    await Shared.CAD.query(`DELETE FROM codes WHERE id = ? AND community_id = ?`, [id, req.community])
    res.status(200).send('Deleted Code')   
})

router.post('/settings/get-permissions', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageMembers, async(req, res) => {
    const perms = await Shared.CAD.query(`SELECT id, username, permission_manage_settings, permission_manage_servers, permission_manage_members, permission_manage_departments, permission_manage_codes, permission_civilian, permission_police_mdt, permission_fire_mdt, permission_dispatch FROM members WHERE community_id = ? ORDER BY username`, [req.community])
    res.status(200).json(perms[0])
})

router.post('/settings/set-permission', middleware.LoggedInMember, middleware.ProvideCommunity, Permission.ManageMembers, async(req, res) => {
    const id = req.body.id
    let permission = req.body.permission
    const enabled = req.body.enabled
    if (!id || !permission) {
        res.status(400).send('No member/permission was provided!')
        return
    }

    permission = permission.toLowerCase()

    const allowedPermissions = [
        'permission_manage_settings',
        'permission_manage_servers',
        'permission_manage_members',
        'permission_manage_departments',
        'permission_manage_codes',
        'permission_civilian',
        'permission_police_mdt',
        'permission_fire_mdt',
        'permission_dispatch',
    ]

    if (!allowedPermissions.includes(permission) || permission.toLowerCase().includes('password') || permission.toLowerCase().includes('email') || permission.toLowerCase().includes('username')) {
        res.status(400).send('Invalid permission supplied!')
        return
    }

    //Make Sure User Cannot Update Themself
    if (id == req.member) {
        res.status(403).send('You may not modify your own permissions!')
        return
    }

    //Make Sure User is Not Owner
    const checkOwner = await Shared.CAD.query(
        `SELECT id FROM communities WHERE id = ? AND owner_member_id = ?`,
        [req.community, id]
    )
    if (checkOwner[0].length) {
        res.status(403).send('This user is immune to permission changes!')
        return
    }

    if (enabled) {
        await Shared.CAD.query(`UPDATE members SET ${permission} = 1 WHERE id = ? AND community_id = ?`, [id, req.community])
    } else {
        await Shared.CAD.query(`UPDATE members SET ${permission} = NULL WHERE id = ? AND community_id = ?`, [id, req.community])
    }

    res.status(200).send('Permission changed!')
})

module.exports = {}
module.exports.settingsRoutes = router