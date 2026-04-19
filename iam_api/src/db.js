const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'db_iam', // O nome exato do contentor no docker-compose.yaml
    user: process.env.DB_USER, // Vai ler "admin" do .env
    password: process.env.DB_PASSWORD, // Vai ler "admin" do .env
    database: 'auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;