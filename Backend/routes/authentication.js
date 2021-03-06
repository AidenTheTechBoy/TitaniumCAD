// External Resources
const router = require('express').Router()

const mysql = require('mysql2')
const bcrypt = require('bcrypt');
const crypto = require('crypto-random-string');
const Cookies = require('cookies')

// Internal Resources
const emailer = require('../emailer');
const ratelimits = require('../ratelimits')

// Database Connection
const CAD = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: 'cad',
}).promise()

// Regex
const EMAIL_REGEX = new RegExp("\\b[\\w\\.-]+@[\\w\\.-]+\\.\\w{2,4}\\b")
const USERNAME_REGEX = new RegExp("^(?!.*\\.\\.)(?!.*\\.$)[^\\W][\\w.]{4,29}$")
const PASSWORD_REGEX = new RegExp("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\W]).{8,25})")

// JSON Parser


// Account Registration
router.post('/register', ratelimits.createLimit1, ratelimits.createLimit2, async (req, res) => {

    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const access_code = req.body.access_code
    
    let community_id = null
    if (access_code) {
        let found = await CAD.query(`SELECT id FROM communities WHERE access_code = ?`, [access_code])
        if (found[0].length > 0) {
            community_id = found[0][0].id
        } else {
            res.status(400).send('No community was found with that access code.')
            return
        }
    }

    if (!email || !username || !password) {
        res.status(400).send('You must supply an email, a username, and a password!')
        return
    }

    if (!EMAIL_REGEX.test(email)) {
        res.status(400).send('Invalid email!')
        return
    }

    if (!USERNAME_REGEX.test(username)) {
        res.status(400).send('Username does not meet requirements!')
        return
    }

    if (!PASSWORD_REGEX.test(password)) {
        res.status(400).send('Password does not meet requirements!')
        return
    }

    if (await IsEmailUsed(email, community_id)) {
        res.status(400).send('The specified email is already being used!')
        return
    }

    if (await DoesUsernameExist(username, community_id)) {
        res.status(400).send('A user already exists with the given username!')
        return
    }
    
    await CreateUser(email, username, password, community_id)
    res.status(201).send('Account created!')

})

// Login (send verification email)
router.post('/login', ratelimits.loginLimit1, ratelimits.loginLimit2, async (req, res) => {

    let cookies = new Cookies(req, res)

    const email = req.body.email
    const password = req.body.password
    const access_code = req.body.access_code

    let community_id = null
    if (access_code) {
        let found = await CAD.query(`SELECT id FROM communities WHERE access_code = ?`, [access_code])
        if (found[0].length > 0) {
            community_id = found[0][0].id
        } else {
            res.status(400).send('No community was found with that access code.')
            return
        }
    }

    const { cookie, expiration } = await Login(email, password, community_id, req.ip)
    
    if (cookie) {
        if (cookie == 'VERIFY') {
            res.status(403).send('A verification link has been sent to your email, please check your email and click the link.')
            return
        }

        cookies.set('session', cookie, { expires: Date.now() + 43200000, maxAge: 43200000 })

        //Get Username
        let username = ''
        if (access_code) {
            let user = await CAD.query(`SELECT username FROM members WHERE email = ?`, [email])
            username = user[0][0].username
        } else {
            let user = await CAD.query(`SELECT username FROM users WHERE email = ?`, [email])
            username = user[0][0].username
        }
        
        if (access_code) {
            res.status(200).json({cookie: cookie, expiration: expiration, username: username, community: community_id})
        } else {
            res.status(200).json({cookie: cookie, expiration: expiration, username: username})
        }

        
        return
    }

    res.status(403).send('Email or password incorrect!')
    
})

// Forgot Password
router.get('/forgot-password', ratelimits.forgotPassword1, async (req, res) => {
    const email = req.body.email
    const access_code = req.body.access_code

    let community_id = null
    if (access_code) {
        let found = await CAD.query(`SELECT id FROM communities WHERE access_code = ?`, [access_code])
        if (found[0].length > 0) {
            community_id = found[0][0].id
        } else {
            res.status(400).send('No community was found with that access code.')
            return
        }
    }

    if (email && community_id) {
        const members = await CAD.query(`SELECT * FROM members WHERE email = ?`, email)
        if (members[0].length > 0) {
            const member = members[0][0]
            const code = crypto({length: 30})
            await CAD.query(`INSERT INTO forgotpassword (member_id, code, expiration) VALUES (?, ?, ?)`, [member.id, code, Date.now() + 3600000]) // 1hr
            
            //TODO: Add IP to email
            const sentEmail = await emailer.SendEmail(email, 'Password Reset', `${process.env.BACKEND_URL}/reset-password?code=${code}`, `${process.env.BACKEND_URL}/reset-password?code=${code}`)
            console.log(sentEmail)

            res.status(200).send('Password reset email sent!')
            return
        }
        res.status(400).send('Invalid email!')
        return
    }

    if (email && !community_id) {
        const users = await CAD.query(`SELECT * FROM users WHERE email = ?`, email)
        if (users[0].length > 0) {
            const user = users[0][0]
            const code = crypto({length: 30})
            await CAD.query(`INSERT INTO forgotpassword (user_id, code, expiration) VALUES (?, ?, ?)`, [user.id, code, Date.now() + 3600000]) // 1hr
            
            //TODO: Add IP to email
            const sentEmail = await emailer.SendEmail(email, 'Password Reset', `${process.env.BACKEND_URL}/reset-password?code=${code}`, `${process.env.BACKEND_URL}/reset-password?code=${code}`)
            console.log(sentEmail)

            res.status(200).send('Password reset email sent!')
            return
        }
        res.status(400).send('Invalid email!')
        return
    }

    res.status(400).send('Must provide an email!')
})

// Forgot Password
router.post('/reset-password', async (req, res) => {
    const code = req.body.code
    const password = req.body.password
    if (code && password) {

        if (!PASSWORD_REGEX.test(password)) {
            res.status(400).send('Bad password!')
            return
        }

        await CAD.query(`DELETE FROM forgotpassword WHERE expiration < ?`, [Date.now()])
        const response = await CAD.query(`SELECT user_id, member_id FROM forgotpassword WHERE code = ?`, [code])
        if (response[0].length > 0) {

            let hashedPassword = await bcrypt.hash(password, 10)

            const person = response[0][0]
            if (person.user_id) {
                await CAD.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, person.user_id])
                await CAD.query(`DELETE FROM forgotpassword WHERE user_id = ?`, [person.user_id])
                res.status(200).send('User password reset.')
                return
            }
            if (person.member_id) {
                await CAD.query(`UPDATE members SET password = ? WHERE id = ?`, [hashedPassword, person.member_id])
                await CAD.query(`DELETE FROM forgotpassword WHERE member_id = ?`, [person.member_id])
                res.status(200).send('Member password reset.')
                return
            }
        }
        return
    }
    res.status(400).send('Must specify a code and a new password!')
})

// Logout of Panel
router.post('/logout', async (req, res) => {
    const cookies = new Cookies(req, res)
    const session = cookies.get('session')
    await CAD.query(`DELETE FROM cookies WHERE session = ?`, [session])
    res.status(200).send('Logged Out')
})

// Verify Email
router.get('/verify', async (req, res) => {
    const code = req.query.code
    if (code) {
        VerifyEmail(code, res)
        return
    }
    res.status(400).send('No Code Specified')
})


/**
 * Checks if a Email is Used
 * @param {string} email
 * @param {int} community_id
 * @returns {boolean} 
*/
async function IsEmailUsed(email, community_id) {
    if (community_id) {
        let res = await CAD.query(`SELECT id FROM members WHERE community_id = ? AND email = ?`, [community_id, email])
        return res[0].length > 0
    }
    let res = await CAD.query(`SELECT id FROM users WHERE email = ?`, [email])
    return res[0].length > 0
}

/**
 * Checks if a User Exists
 * @param {string} username
 * @param {int} community_id
 * @returns {boolean} 
*/
async function DoesUsernameExist(username, community_id) {
    if (community_id) {
        let res = await CAD.query(`SELECT id FROM members WHERE community_id = ? AND username = ?`, [community_id, username])
        return res[0].length > 0
    }
    let res = await CAD.query(`SELECT id FROM users WHERE username = ?`, [username])
    return res[0].length > 0
}

/**
 * Create User
 * @param {string} email
 * @param {string} username
 * @param {string} password
 * @param {int} community_id
 * @returns {boolean} 
*/
async function CreateUser(email, username, password, community_id) {
    let currentTime = Date.now()
    const hashedPassword = await bcrypt.hash(password, 10)

    if (community_id) {

        //Check if Community is Public
        let isPublic = false
        if ( (await CAD.query(`SELECT public FROM communities WHERE id = ?`, [community_id]))[0][0].public  ) {
            isPublic = true
        }
            
        await CAD.query(`INSERT INTO members (community_id, email, username, password, verified, permission_civilian) VALUES (?, ?, ?, ?, false, ?)`, [community_id, email, username, hashedPassword, isPublic])
        return true
        
    }
    await CAD.query(`INSERT INTO users (email, username, password, verified) VALUES (?, ?, ?, false)`, [email, username, hashedPassword])
}

/**
 * Login As User
 * @param {string} email
 * @returns {boolean} 
*/
async function Login(email, password, community_id, ip) {

    if (community_id) {
        //Get Accounts with Email
        const res = await CAD.query(`SELECT id, username, password, verified FROM members WHERE email = ? AND community_id = ?`, [email, community_id])
        if (res[0].length > 0) {
            const member = res[0][0]

            //Verify Password
            const passwordValid = await bcrypt.compare(password, member.password)
            if (passwordValid) {
                if (!member.verified) {

                    //Remove Existing Verification Links
                    await CAD.query(`DELETE FROM verification WHERE member_id = ?`, [member.id])

                    const code = crypto({length: 30})
                    const expiration = Date.now() + 43200000 //12 Hours
                    await CAD.query(`INSERT INTO verification (member_id, code, expiration) VALUES (?, ?, ?)`, [member.id, code, expiration])

                    const {name, access_code} = (await CAD.query(`SELECT name, access_code FROM communities WHERE id = ?`, [community_id]))[0][0]
                    console.log(name, access_code)

                    const sentEmail = await emailer.SendEmail(
                        email,
                        `Verify Your Account (${access_code.toLowerCase()})`,
                        `Click this link to verify your email: ${process.env.BACKEND_URL}/verify?code=${code}`,
                        await emailer.CreateEmail('verify', {
                            community_name: name.toUpperCase(),
                            ip: ip,
                            username: member.username,
                            email: email,
                            verify_link: `${process.env.BACKEND_URL}/verify?code=${code}`
                        })
                    )

                    return {cookie: 'VERIFY', expiration: null}

                }

                //Return Existing
                const activeCookie = await CAD.query(`SELECT session, expiration FROM cookies WHERE member_id = ? AND expiration > ?`, [member.id, Date.now() + 7200000]) // at least 2hours
                if (activeCookie[0].length > 0) {
                    return {cookie: activeCookie[0][0].session, expiration: activeCookie[0][0].expiration}

                }

                //Remove Existing Cookies
                await CAD.query(`DELETE FROM cookies WHERE member_id = ?`, [member.id])

                //Create Cookie
                const sessionKey = crypto({length: 30})
                const expiration = Date.now() + 43200000 //12 Hours
                await CAD.query(`INSERT INTO cookies (member_id, session, expiration) VALUES (?, ?, ?)`, [member.id, sessionKey, expiration]) //12 Hours
                
                //Return Session Key
                return {cookie: sessionKey, expiration: expiration} 

            }
            return [ null, null ]
            
        }
        return [ null, null ]
    }
    
    //Get Accounts with Email
    const res = await CAD.query(`SELECT id, username, password, verified FROM users WHERE email = ?`, [email])
    if (res[0].length > 0) {
        const user = res[0][0]

        //Verify Password
        const passwordValid = await bcrypt.compare(password, user.password)
        if (passwordValid) {
            if (!user.verified) {

                //Remove Existing Verification Links
                await CAD.query(`DELETE FROM verification WHERE user_id = ?`, [user.id])

                const code = crypto({length: 30})
                const expiration = Date.now() + 43200000 //12 Hours
                await CAD.query(`INSERT INTO verification (user_id, code, expiration) VALUES (?, ?, ?)`, [user.id, code, expiration])

                const sentEmail = await emailer.SendEmail(
                    email,
                    'Verify Your TitaniumCAD Manager Account',
                    `Click this link to verify your email: ${process.env.BACKEND_URL}/verify?code=${code}`,
                    await emailer.CreateEmail('verify', {
                        community_name: 'TitaniumCAD Manager',
                        ip: ip,
                        username: user.username,
                        email: email,
                        verify_link: `${process.env.BACKEND_URL}/verify?code=${code}`
                    })
                )
                
                return {cookie: 'VERIFY', expiration: null}

            }

            //Return Existing
            const activeCookie = await CAD.query(`SELECT session, expiration FROM cookies WHERE user_id = ? AND expiration > ?`, [user.id, Date.now() + 7200000]) // at least 2hours
            if (activeCookie[0].length > 0) {
                return {cookie: activeCookie[0][0].session, expiration: activeCookie[0][0].expiration} 
            }

            //Remove Old
            await CAD.query(`DELETE FROM cookies WHERE user_id = ?`, [user.id])
           
            //Create New Cookie
            const sessionKey = crypto({length: 30})
            const expiration = Date.now() + 43200000 //12 Hours
            await CAD.query(`INSERT INTO cookies (user_id, session, expiration) VALUES (?, ?, ?)`, [user.id, sessionKey, expiration]) //12 Hours
            
            //Return Session Key
            return {cookie: sessionKey, expiration: expiration}

        }
        return false
        
    }
    return false
}

/**
 * Login As User
 * @param {string} code
 * @param {Request} res
*/
async function VerifyEmail(code, res) {

    //Remove Expired
    await CAD.query(`DELETE FROM verification WHERE expiration < ?`, [Date.now()])

    //Verify
    const response = await CAD.query(`SELECT user_id, member_id FROM verification WHERE code = ?`, [code])
    if (response[0].length > 0) {
        const person = response[0][0]
        if (person.user_id) {
            await CAD.query(`UPDATE users SET verified = true WHERE id = ?`, [person.user_id])
            await CAD.query(`DELETE FROM verification WHERE user_id = ?`, [person.user_id])
            // res.status(200).send('User Account Verified')
            res.redirect(process.env.FRONTEND_URL)
            return
        }
        if (person.member_id) {
            await CAD.query(`UPDATE members SET verified = true WHERE id = ?`, [person.member_id])
            await CAD.query(`DELETE FROM verification WHERE member_id = ?`, [person.member_id])
            res.status(200).send('Member Account Verified')
            return
        }
    }
    res.status(400).send('That code does not exist!')

}

/**
 * Gets A Users ID
 * @param {Request} req
 * @param {Response} res
 * @param {IDTypes} type
 * @returns {int} 
*/
async function GetID(req, res, type) {
    const cookies = new Cookies(req, res)

    let session = cookies.get('session')
    if (req.body.cookie) {
        session = req.body.cookie
    }

    let results = await CAD.query(`SELECT user_id, member_id FROM cookies WHERE session = ?`, [session])
    if (results[0].length > 0) {
        if (type == 'USER') {
            if (results[0][0].user_id) {
                return results[0][0].user_id
            }   
        }
        if (type == 'MEMBER') {
            if (results[0][0].member_id) {
                return results[0][0].member_id
            }   
        }
    }
    return null
}

async function GetCommunityIDFromAccessCode(access_code) {
    let communities = await CAD.query(`SELECT id FROM communities WHERE access_code = ?`, [access_code])
    if (communities[0].length > 0) {
        return communities[0][0].id
    }
    return null
}

module.exports = { GetID, IsEmailUsed, DoesUsernameExist, CreateUser, GetCommunityIDFromAccessCode }
module.exports.authRoutes = router