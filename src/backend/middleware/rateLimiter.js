const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const limiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rate_limit:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

const mintLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'mint_limit:'
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 mints per hour
    message: 'Mint rate limit exceeded'
});

module.exports = { limiter, mintLimiter };