const dotenv = require("dotenv");
const sql = require("mssql");

dotenv.config();

const getDbConfig = () => ({
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

let cachedPoolPromise = null;

const getPoolPromise = () => {
  if (!cachedPoolPromise) {
    const config = getDbConfig();
    cachedPoolPromise = new sql.ConnectionPool(config).connect();
  }

  return cachedPoolPromise;
};

const poolPromise = getPoolPromise();

module.exports = {
  sql,
  getDbConfig,
  getPoolPromise,
  poolPromise,
};
