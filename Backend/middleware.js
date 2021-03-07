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

const ProvideSecret = async function (req, res, next) {

    //Get Secret
    const secret = req.body.secret
    if (!secret) {
        res.status(400).send('A secret must be provided!')
        return
    }

    //Get Server
    const server = await CAD.query(`SELECT id FROM servers WHERE secret = ?`, [secret])
    if (!server[0].length) {
        res.status(403).send('No server found with that secret!')
        return
    }

    req.server = server[0][0].id

    next()
}

const GetPlanRestrictions = async function (req, res, next) {

    if (!req.community) {
        if (!req.server) {
            res.status(400).send('No server or community provided! Unable to check plan.')
            return
        }
        const community = await CAD.query(`SELECT community_id FROM servers WHERE id = ?`, [req.server])
        req.community = community[0][0].community_id
    }

    // Select Plan
    const plan = await CAD.query(`SELECT plan FROM communities WHERE id = ?`, [req.community])

    // Add to Request
    req.plan = plan[0][0].plan

    // Find Restrictions
    switch (req.plan) {
        case 0:
           req.restrictions = {
            users: 50,
            activeUnits: 3,
            servers: 1,
            departments: 3,
            civilians: 2,
            liveMap: false,
            webhooks: 0,
            customization: false,
            }
            break
        case 1:
            req.restrictions = {
                users: -1,
                activeUnits: 10,
                servers: 1,
                departments: 5,
                civilians: 4,
                liveMap: false,
                webhooks: 1,
                customization: false,
            }
            break
        case 2:
            req.restrictions = {
                users: -1,
                activeUnits: 15,
                servers: 2,
                departments: 8,
                civilians: 8,
                liveMap: true,
                webhooks: 2,
                customization: true,
            }
            break
        case 3:
            req.restrictions = {
                users: -1,
                activeUnits: -1,
                servers: -1,
                departments: -1,
                civilians: -1,
                liveMap: true,
                webhooks: 2,
                customization: true,
            }
            break
    }

    // Continue
    next()

}

module.exports = { LoggedInUser, LoggedInMember, ProvideCommunity, ProvideCivilianAuth, ProvideCommunityID, ProvideServerID, ProvideSecret, GetPlanRestrictions}