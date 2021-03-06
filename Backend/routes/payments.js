//Import Stripe
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);
const stripe_webhook_secret = process.env.STRIPE_WEBHOOK_SECRET

//Required Imports
const router = require('express').Router()
const middleware = require('../middleware')
const Shared = require('../shared');
const fetch = require('node-fetch')

//Prices
let prices = {
    STARTER: process.env.STRIPE_PRICE_STARTER,
    PLUS: process.env.STRIPE_PRICE_PLUS,
    PRO: process.env.STRIPE_PRICE_PRO
}

//Reverse the Price
function ReversePrice(price_id, index) {
    let i = 1
    for (const price in prices) {
        if (prices[price] == price_id) {
            if (index) {
                return i
            }
            return price
        }
        i++
    }
}

//Update Community Plan
function UpdatePlan(user_id, plan) {
    Shared.CAD.query(
        `UPDATE communities SET plan = ? WHERE user_id = ?`,
        [plan, user_id]
    )
}

//User Metadata Info
async function GetMetadata(user_id) {
    let user = await Shared.CAD.query(
        `SELECT id, email, username FROM users WHERE id = ?`,
        [user_id]
    )
    let userData = user[0][0]
    return ({
        'titanium_id': userData.id,
        'titanium_email': userData.email,
        'titanium_username': userData.username,
    })
}

//Create Checkout Session
router.post('/create-checkout', middleware.LoggedInUser, async (req, res) => {

    //Confirm User Has Server
    const servers = await Shared.CAD.query(`SELECT id FROM communities WHERE user_id = ?`,[req.user])
    if (!servers[0].length) {
        res.status(403)
        res.send('You must create a server before purchasing a premium plan!')
        return
    }

    //Get Customer ID
    const user = await Shared.CAD.query(`SELECT customer_id, subscription_id FROM users WHERE id = ?`,[req.user])

    if (user[0][0].subscription_id) {
        res.status(403)
        res.send('There is already an active subscription!')
        return
    }

    //Get Price From Request
    const package = req.body.package

    if (package != 'STARTER' && package != 'PLUS' && package != 'PRO') {
        res.status(400)
        res.send('Invalid Package Name')
        return
    }

    try {

        //Create Session Data
        const sessionData = 
        {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: prices[package],
                    quantity: 1
                }
            ],
            success_url: `${Shared.Config.url}/manager/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${Shared.Config.url}/manager/canceled`,
            metadata: await GetMetadata(req.user),
            
        }

        //Add Customer
        if (user[0][0].customer_id) {
            sessionData.customer = user[0][0].customer_id
        }

        //Create Session
        const session = await stripe.checkout.sessions.create(sessionData)

        //Send Session
        res.send({
            session_id: session.id
        })

    }
    catch (err) {
        res.status(400)
        res.send(err.message)
    }
})

//Create Manager Session
router.post('/portal', middleware.LoggedInUser, async (req, res) => {
    //Get Customer ID
    let customer_id = (await Shared.CAD.query(`SELECT customer_id FROM users WHERE id = ?`,[req.user]))[0][0].customer_id
    if (!customer_id) {
        res.status(403)
        res.send('There is no subscription to manage?')
        return
    }
    //Try to Create Session
    try {
        const portal_session = await stripe.billingPortal.sessions.create({
            customer: customer_id,
            return_url: `${Shared.Config.url}/manager/dashboard`,
        })
        res.send({url: portal_session.url})   
    }
    catch (err) {
        res.status(400)
        res.send(err.message)
    }
})

//Create Manager Session
router.post('/checkSubscription', middleware.LoggedInUser, async (req, res) => {
    //Get Customer ID
    let subscription_id = (await Shared.CAD.query(`SELECT subscription_id FROM users WHERE id = ?`,[req.user]))[0][0].subscription_id
    if (subscription_id) {
        res.status(200)
        res.json({has: true})
        return
    }
    res.status(200)
    res.json({has: false})
})

//Create Manager Session
router.post('/getPlan', middleware.LoggedInUser, async (req, res) => {

    //Get Customer ID
    let plan = (await Shared.CAD.query(`SELECT plan FROM communities WHERE user_id = ?`,[req.user]))[0]

    if (!plan.length) {
        res.status(200).json({message: `You do not currently own a server. To purchase a subscription, you first need to create a server!`})
        return
    }

    plan = plan[0].plan

    res.status(200)
    if (plan == 1) {
        res.json({message: `You are currently paying $4.99/mo for Titanium Starter. To manage your plan, or cancel your subscription, use the button below.`})
        return
    }
    if (plan == 2) {
        res.json({message: `You are currently paying $9.99/mo for Titanium Plus. To manage your plan, or cancel your subscription, use the button below.`})
        return
    }
    if (plan == 3) {
        res.json({message: `You are currently paying $19.99/mo for Titanium Pro. To manage your plan, or cancel your subscription, use the button below.`})
        return
    }
    res.json({message: 'This is weird? We have a subscription in our database, but your community does not appear to have any plan. If you are paying for a plan, contact support!'})
})

//Manage Payments
router.post('/webhook', async (req, res) => {

    //Verify Event
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, stripe_webhook_secret)

    //Manage Checkout Session
    if (event.type === 'checkout.session.completed') {

        //Get User ID
        const user_id = event.data.object.metadata.titanium_id
        
        //Get Community ID
        const communities = await Shared.CAD.query(`SELECT id FROM communities WHERE user_id = ?`, [user_id])
        const community_id = communities[0][0].id

        //Set Customer and Subscription Objects
        Shared.CAD.query(
            `UPDATE users SET customer_id = ?, subscription_id = ? WHERE id = ?`,
            [event.data.object.customer, event.data.object.subscription, user_id]
        )

        //Update Community Plan
        const subscription = await stripe.subscriptions.retrieve(event.data.object.subscription)
        UpdatePlan(user_id, ReversePrice(subscription.items.data[0].price.id, true))

        //Add Customer Metadata
        await stripe.customers.update(
            event.data.object.customer,
            {
                metadata: await GetMetadata(user_id)
            }
        )

        //Send Positive Request Status
        res.status(200)
        res.send('Payment Registered')

    }

    //Manage Subscription Cancellation
    if (event.type === 'customer.subscription.deleted') {

        //Remove Subscription
        const subscription = event.data.object.id
        Shared.CAD.query(
            `UPDATE users SET subscription_id = NULL WHERE subscription_id = ? `,
            [subscription]
        )
        
        //Update Community Plan
        let user_id = (await Shared.CAD.query(`SELECT id FROM users WHERE customer_id = ?`, [event.data.object.customer]))[0][0].id
        UpdatePlan(user_id, 0)

        //Send Positive Request Status
        res.status(200)
        res.send('Subscription Removed')

    }

    //Manage Subscription Cancellation
    if (event.type === 'customer.subscription.updated') {

        if (event.data.object.status == 'active') {
            //Get User ID
            let user_id = (await Shared.CAD.query(`SELECT id FROM users WHERE customer_id = ?`, [event.data.object.customer]))[0][0].id

            //Update Package
            const price_id = event.data.object.items.data[0].price.id
            UpdatePlan(user_id, ReversePrice(price_id, true))
        }

        //Send Positive Request Status
        res.status(200)
        res.send('Subscription Updated')

    }

})


module.exports = {}
module.exports.paymentRoutes = router