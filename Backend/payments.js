const { NULL } = require("mysql2/lib/constants/types")

const SUBSCRIPTION_LIMITS = {
    0: {
        MAX_SERVERS: 1,
    },
    1: {
        MAX_SERVERS: 1,
    },
    2: {
        MAX_SERVERS: 2,
    },
    3: {
        MAX_SERVERS: NULL,
    },
}

module.exports = { SUBSCRIPTION_LIMITS }