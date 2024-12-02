const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST || '185.193.19.48',
    port: process.env.DB_PORT || 5434,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'Him123@#$',
    database: process.env.DB_NAME || 'prepbook'
});

module.exports = pool;
