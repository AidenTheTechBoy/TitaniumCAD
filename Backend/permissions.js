const Shared = require("./shared")

const ManageSettings = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'MANAGE_SETTINGS')
    if (hasPermission) next()
}

const ManageServers = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'MANAGE_SERVERS')
    if (hasPermission) next()
}

const ManageMembers = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'MANAGE_MEMBERS')
    if (hasPermission) next()
}
const ManageDepartments = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'MANAGE_DEPARTMENTS')
    if (hasPermission) next()
}

const ManageCodes = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'MANAGE_CODES')
    if (hasPermission) next()
}

const Civilian = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'CIVILIAN')
    if (hasPermission) next()
}

const Police = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'POLICE_MDT')
    if (hasPermission) next()
}

const Fire = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'FIRE_MDT')
    if (hasPermission) next()
}

const Dispatch = async function (req, res, next) {
    const hasPermission = await Middleware(req, res, next, 'DISPATCH')
    if (hasPermission) next()
}

async function Middleware (req, res, next, permission) {
    const authorized = await CheckPermissions(req.community, req.member, permission)
    if (authorized) {
        return true
    }
    res.status(403).send('You do not have permission to perform this action.')
    return false
}

async function CheckPermissions(community_id, member_id, permission) {

    //Check Owner
    const checkOwner = await Shared.CAD.query(
        `SELECT id FROM communities WHERE id = ? AND owner_member_id = ?`,
        [community_id, member_id]
    )
    if (checkOwner[0].length) return true

    //Check Permission
    const checkPerms = await Shared.CAD.query(
        `SELECT id FROM members WHERE id = ? AND permission_${permission.toLowerCase()} = 1`,
        [community_id, member_id]
    )
    if (checkPerms[0].length) return true

    return false
}

async function PermissionsArray(req, res, permissions) {

    //Check Owner
    const checkOwner = await Shared.CAD.query(
        `SELECT id FROM communities WHERE id = ? AND owner_member_id = ?`,
        [req.community, req.member]
    )
    if (checkOwner[0].length) return true

    //Get User
    const checkPerms = await Shared.CAD.query(
        `SELECT id, permission_manage_settings, permission_manage_servers, permission_manage_members, permission_manage_departments, permission_manage_codes, permission_civilian, permission_police_mdt, permission_fire_mdt, permission_dispatch FROM members WHERE id = ?`,
        [req.member]
    )
    
    //Check if User Has Permissions
    const member = checkPerms[0][0]
    for (const i in permissions) {
        const permission = permissions[i]
        if (member[`permission_${permission.toLowerCase()}`]) {
            return true
        }
    }

    res.status(403).send('You do not have permission to perform this action.')
    return false
}

module.exports = {
    Permission: {
        ManageSettings,
        ManageServers,
        ManageMembers,
        ManageDepartments,
        ManageCodes,
        Civilian,
        Police,
        Fire,
        Dispatch
    },
    PermissionsArray
}