const rateLimit = require("express-rate-limit");

const rateLimits = {

    // 3 req / 30 seconds
    loginLimit1: rateLimit({
        windowMs: 30 * 1000,
        max: 3,
        message: "You are sending login requests too quickly!"
    }),
    // 20 req / 10 min
    loginLimit2: rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 20,
        message: "To many logins from this IP! Try again in ten minutes!"
    }),

    // 10 req / 10 min
    createLimit1: rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 10,
        message: "To many attempted creations from this IP! Wait 10 minutes!"
    }),
    // 3 req / 1 Hour
    createLimit2: rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 3,
        message: "You have created too many accounts! Wait an hour!",
        skipFailedRequests: true
    }),

    // 2 req / 60 min
    forgotPassword1: rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 2,
        message: "To many attempted password resets from this IP! Use the link in your inbox, or wait an hour!"
    }),

}

module.exports = rateLimits