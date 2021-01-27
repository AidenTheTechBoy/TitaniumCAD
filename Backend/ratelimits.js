const rateLimit = require("express-rate-limit");

const rateLimits = {
    // 20 req / 10 min
    loginLimit: rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 20,
        message: "To many logins from this IP! Try again in ten minutes!"
    }),

    // 10 req / 30 min
    createLimit: rateLimit({
        windowMs: 30 * 60 * 1000,
        max: 10,
        message: "To many attempted creations from this IP! Wait 30 minutes!"
    }),

    // 2 req / 60 min
    forgotPassword: rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 6,
        message: "To many attempted password resets from this IP! Wait two hours and try again."
    }),
}

module.exports = rateLimits