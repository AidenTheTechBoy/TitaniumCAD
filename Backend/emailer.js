const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const aws = require('aws-sdk');
const fs = require('fs')

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_PRIVATE_KEY,
    region: 'us-east-2'
})

var lastSent = {}
async function SendEmail(email, subject, text, html) {

    if (!lastSent[email] || lastSent[email] < Date.now() - 300000) { // 5 min delay

        let transporter = nodemailer.createTransport({
            SES: new aws.SES({
                apiVersion: '2010-12-01'
            })
        })

        let info = await transporter.sendMail({
            from: '"Titanium CAD" <noreply@titaniumcad.com>',
            to: email,
            subject: subject,
            text: text,
            html: html,
        })

        lastSent[email] = Date.now()
        
        return 'Email Sent'

    }

    return false

}

async function CreateEmail(template_name, fill_data) {
    const data = fs.readFileSync(`./emails/${template_name}.hbs`)
    const template = handlebars.compile(data.toString())
    return template(fill_data)
}

module.exports = { SendEmail, CreateEmail }