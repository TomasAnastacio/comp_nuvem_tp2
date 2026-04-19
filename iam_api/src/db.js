const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'db_iam',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;