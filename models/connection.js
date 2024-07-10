const mysql = require("mysql2/promise");

// Create the connection pool to the database
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "bashvote",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err.message);
});

// Export the promise-based interface of the pool
module.exports = pool;
