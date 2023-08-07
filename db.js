const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dmrc_test',
  password: 'root',
  port: 5432, 
});

module.exports = pool;
