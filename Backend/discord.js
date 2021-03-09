const Discord = require('discord.js');
const Shared = require('./shared');

async function SendWebhook(community, type, embed) {
    //TODO: ADD MORE THAN GLOBAL
    const webhooks = await Shared.CAD.query('SELECT webhook_global, webhook_calls FROM communities WHERE id = ?', [community])
    const globalHook = SplitWebhook(webhooks[0][0].webhook_global)
    if (globalHook) {
        const webhook = new Discord.WebhookClient(globalHook.id, globalHook.token)
        webhook.send(null, {
            username: 'Titanium CAD',
            avatarURL: 'https://api.titaniumcad.com/static/assets/images/TitaniumCAD.png',
            embeds: [embed]
        })
    }
}

function SplitWebhook(url) {
    const components = url.split('\/')
    if (components.length < 2) {
        console.log('no valid webhook found')
        return null
    }
    return {
        id: components[components.length - 2],
        token: components[components.length - 1]
    }
}

module.exports = { SendWebhook }