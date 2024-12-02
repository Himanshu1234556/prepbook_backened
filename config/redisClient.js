const Redis = require('ioredis');

// Create a Redis connection
const redis = new Redis({
    host: '185.193.19.48', // Redis server hostname or IP address
    port: 6379,        // Redis server port
    password: 'Him123', // Uncomment and set if your Redis instance requires authentication
});

module.exports = redis;
