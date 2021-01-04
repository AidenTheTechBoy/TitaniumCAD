const authentication = require("./routes/authentication")
const Shared = require("./shared")
const { CAD } = require("./shared")

const LoggedInUser = async function (req, res, next) {
    const user_id = await authentication.GetID(req, res, 'USER')
    if (!user_id) {
        res.status(403).send('You must be logged in to perform this action!')
        return
    }
    req.user = user_id
    next()
}

const LoggedInMember = async function (req, res, next) {
    const member_id = await authentication.GetID(req, res, 'MEMBER')
    if (!member_id) {
        res.status(403).send('You must be logged in to perform this action!')
        return
    }
    req.member = member_id
    next()
}

const ProvideCommunity = async function (req, res, next) {
    const community_id = await authentication.GetCommunityIDFromAccessCode(req.body.access_code)
    if (!community_id) {
        res.status(400).send('A valid community must be provided!')
        return
    }
    req.community = community_id
    next()
}

const ProvideCommunityID = async function (req, res, next) {
    const community_id = req.body.community_id
    if (!community_id) {
        res.status(400).send('A valid community must be provided!')
        return
    }

    const authTest = await CAD.query(`SELECT id FROM communities WHERE id = ? AND user_id = ?`, [community_id, req.user])
    if (authTest[0].length == 0) {
        res.status(403).send('A valid community must be provided, and you must own it!')
        return
    }

    req.community = community_id
    next()
}

const ProvideCivilianAuth = async function (req, res, next) {

    //Provided
    const civilian_id = req.body.civilian_id
    if (!civilian_id) {
        res.status(400).send('A valid civilian must be provided!')
        return
    }

    //Auth
    const results = await Shared.CAD.query(`SELECT id FROM civilians WHERE id = ? AND community_id = ? AND member_id = ?`, [civilian_id, req.community, req.member])
    if (results[0].length == 0) {
        res.status(403).send('The civilian provided must be your own!')
        return
    }

    req.civilian = civilian_id
    next()
}

const ProvideServerID = async function (req, res, next) {
    const server_id = req.body.server_id
    if (!server_id) {
        res.status(400).send('A valid server must be provided.')
        return
    }

    let results = await CAD.query(`SELECT name FROM servers WHERE id = ?`, [server_id])
    if (results[0].length == 0) {
        res.status(400).send('A valid server must be provided.')
        return
    }

    req.server = server_id
    next()
}

const PermissionInCommunity = async function (req, res, permission) {

    //Check Owner
    const checkOwner = await CAD.query(`SELECT id FROM communities WHERE id = ? AND owner_member_id = ?`, [req.community, req.member])
    if (checkOwner[0].length > 0) {
        return true
    }

    //Check Permission
    const checkPerms = await CAD.query(`SELECT id FROM members WHERE id = ? AND permission_${permission.toLowerCase()} = 1`, [req.community, req.member])
    if (checkPerms[0].length > 0) {
        return true
    }

    res.status(403).send('You do not have permission to perform this action.')
    return false
}

module.exports = { LoggedInUser, LoggedInMember, ProvideCommunity, ProvideCivilianAuth, ProvideCommunityID, PermissionInCommunity, ProvideServerID }