const dotenv = require("dotenv");
const sql = require("mssql");

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const poolPromise = sql
  .connect(config)
  .then((pool) => {
    console.log("Sucessfully connected mssql!");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed: ", err));

module.exports = { poolPromise };

console.log("DB_SERVER:", process.env.DB_SERVER);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PW:", process.env.DB_PW);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);