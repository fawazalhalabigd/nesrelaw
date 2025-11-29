let mysql = require('mysql');

const con = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,   // number of parallel connections
  connectTimeout: 10000, // 10s timeout
  waitForConnections: true,
  queueLimit: 0
});


function first() {
  // No need to call con.connect() with a pool
  console.log("Pool created, ready to query!");

  con.query(`
    CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quesNum INT NOT NULL DEFAULT 0,
        picture VARCHAR(255) NULL
    );
  `, function (err) {
    if (err) throw err;
  });

  con.query(`
    CREATE TABLE IF NOT EXISTS ques (
      id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      quesText VARCHAR(255) NOT NULL,
      ansrText VARCHAR(255) NULL
    );
  `, function (err) {
    if (err) throw err;
  });

  con.query(`
    CREATE TABLE IF NOT EXISTS superUser (
      email VARCHAR(255) NOT NULL PRIMARY KEY
    );
  `, function (err) {
    if (err) throw err;
  });

  con.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      text MEDIUMTEXT NOT NULL,
      likes INT NOT NULL DEFAULT 0
    );
  `, function (err) {
    if (err) throw err;
  });
}



////////////////////////////////////////
// 🔹 Export all functions
////////////////////////////////////////
module.exports = {
  first,
  con
};