const mysql = require('mysql');

const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'admin',
  password : 'admin',
  database : 'projet_node_api'
});

module.exports = pool;

