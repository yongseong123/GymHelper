const { name } = require("ejs");
const { poolPromise } = require("./index");

exports.addNewUser = async function (userInfo) {
  const { id, hashedPassword, username } = userInfo;
  const pool = await poolPromise;
  await pool.query`INSERT INTO users(id, password, username) VALUES
                      (${id}, ${hashedPassword}, ${username});`;
};

exports.getUserById = async function (id) {
  const pool = await poolPromise;
  const { recordset } = await pool.query`SELECT * FROM users WHERE id = ${id}`;
  console.log("getUserById Recordset: ", recordset); // 조회된 사용자 정보 출력
  return recordset;
};

exports.checkIdDuplication = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT id FROM users WHERE id = ${id}`;

  if (recordset.length > 0) return true;
  return false;
};

exports.changePassword = async function (id, newPassword) {
  const pool = await poolPromise;
  await pool.query`UPDATE users SET password = ${newPassword} WHERE id = ${id}`;
};

exports.changeName = async function (id, newName) {
  const pool = await poolPromise;
  await pool.query`UPDATE users SET username = ${newName} WHERE id = ${id}`;
}

exports.getUserName = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT username FROM users WHERE id = ${id}`;
  return recordset[0]?.name;
};

exports.deleteUser = async function (id) {
  const pool = await poolPromise;
  console.log("Deleting User with ID: ", id); // 삭제하려는 사용자 ID 출력
  await pool.query`DELETE FROM users WHERE id = ${id}`;
};