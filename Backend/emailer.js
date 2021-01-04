const nodemailer = require('nodemailer')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var lastSent = {}
async function SendEmail(email, subject, text, html) {

    console.log(lastSent)
    if (!lastSent[email] || lastSent[email] < Date.now() - 300000) { // 5 min delay

        let testAccount = await nodemailer.createTestAccount()

        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            },
        })

        let info = await transporter.sendMail({
            from: '"Titanium CAD" <noreply@titaniumcad.com>',
            to: email,
            subject: subject,
            text: text,
            html: html,
        })

        lastSent[email] = Date.now()

        return nodemailer.getTestMessageUrl(info)

    }

    return false

}

module.exports = { SendEmail }