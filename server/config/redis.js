const Redis = require('ioredis');

let redis = null;

const connectRedis = () => {
    if (process.env.REDIS_ENABLE === 'true' && process.env.REDIS_URL) {
        redis = new Redis(process.env.REDIS_URL, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        });

        redis.on('connect', () => {
            console.log('✅ Redis Connected');
        });

        redis.on('error', (err) => {
            console.error('❌ Redis Error:', err.message);
        });
    } else {
        console.log('ℹ️  Redis Disabled');
    }

    return redis;
};

module.exports = { connectRedis, getRedis: () => redis };