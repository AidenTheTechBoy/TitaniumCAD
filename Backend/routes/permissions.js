const router = require('express').Router()
const Shared = require('../shared')
const middleware = require('../middleware')
const { CAD } = require('../shared')

router.post('/permissions/get', middleware.LoggedInMember, middleware.ProvideCommunity, async(req, res) => {
    if (middleware.PermissionInCommunity(req, res, 'MANAGE_PERMISSIONS')) {
        const permissions = await Shared.CAD.query(`SELECT * FROM permissions WHERE community_id = ?`, [req.community])
        res.status(200).json(permissions[0])
    }
})

router.post('/permissions/set', middleware.LoggedInMember, middleware.ProvideCommunity, async(req, res) => {
    try {
        if (await middleware.PermissionInCommunity(req, res, 'MANAGE_PERMISSIONS')) {
            const permissions = req.body.permissions
            if (!permissions) {
                res.status(400).send('No permissions were specified?')
                return
            }
    
            const member = req.body.member
            if (!member) {
                res.status(400).send('No member was specified.')
                return
            }
    
            if ((await CAD.query(`SELECT id FROM members WHERE id = ? AND community_id = ?`, [member, req.community]))[0].length == 0) {
                res.status(400).send('Invalid member.')
                return
            }
    
            await CAD.query(`DELETE FROM permissions WHERE member_id = ? AND permission <> ? AND community_id = ?`, [req.body.member, 'OWNER', req.community])
    
            for (let perm in permissions.normal) {
                Shared.CAD.query(`INSERT INTO permissions (community_id, member_id, permission) VALUES (?, ?, ?)`, [req.community, member, permissions.normal[perm]])
            }
    
            for (let id in permissions.departments) {
                Shared.CAD.query(`INSERT INTO permissions (community_id, member_id, department_id) VALUES (?, ?, ?)`, [req.community, member, id])
            }
            res.status(200).send('Updating user permissions.')
        }
    }
    catch (err) {
        res.status(500).send('Something went wrong? Check your permissions syntax.')
    }
})

module.exports = {}
module.exports.permissionRoutes = router