const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', //your postgres username
    host: '127.0.0.1',
    database: 'emercado', //your local database 
    password: 'siva@1970', //your postgres user password
    port: 5432, //your postgres running port
});

pool.connect();


module.exports = pool;