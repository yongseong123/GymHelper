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
    console.log("Successfully connected to MSSQL!");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed: ", err));

module.exports = { poolPromise };