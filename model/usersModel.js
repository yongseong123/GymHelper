const { getPoolPromise } = require("./index");

const getPool = async () => getPoolPromise();

exports.addNewUser = async (userInfo) => {
  const { id, hashedPassword, username } = userInfo;
  const pool = await getPool();

  await pool.query`
    INSERT INTO users(id, password, username)
    VALUES (${id}, ${hashedPassword}, ${username});
  `;
};

exports.getUserById = async (id) => {
  const pool = await getPool();
  const { recordset } = await pool.query`SELECT * FROM users WHERE id = ${id}`;
  return recordset;
};

exports.checkIdDuplication = async (id) => {
  const pool = await getPool();
  const { recordset } = await pool.query`SELECT id FROM users WHERE id = ${id}`;
  return recordset.length > 0;
};

exports.changePassword = async (id, newPassword) => {
  const pool = await getPool();
  await pool.query`UPDATE users SET password = ${newPassword} WHERE id = ${id}`;
};

exports.changeName = async (id, newName) => {
  const pool = await getPool();
  await pool.query`UPDATE users SET username = ${newName} WHERE id = ${id}`;
};

exports.getUserName = async (id) => {
  const pool = await getPool();
  const { recordset } = await pool.query`SELECT username FROM users WHERE id = ${id}`;
  return recordset[0]?.username;
};

exports.deleteUser = async (id) => {
  const pool = await getPool();
  await pool.query`DELETE FROM users WHERE id = ${id}`;
};
