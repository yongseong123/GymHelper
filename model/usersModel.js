const { name } = require("ejs");
const { poolPromise } = require("./index");

exports.addNewUser = async function (userInfo) {
  const { id, hashedPassword, username } = userInfo;
  const pool = await poolPromise;
  await pool.query`INSERT INTO Student(student_id, password, name) VALUES
                      (${id}, ${hashedPassword}, ${username});`;
};

exports.getUserById = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM Student WHERE student_id = ${id}`;
  return recordset;
};

exports.checkIdDuplication = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT student_id FROM Student WHERE student_id = ${id}`;

  if (recordset.length > 0) return true;
  return false;
};

exports.changePassword = async function (id, newPassword) {
  const pool = await poolPromise;
  await pool.query`UPDATE Student SET password = ${newPassword} WHERE student_id = ${id}`;
};

exports.changeName = async function (id, newName) {
  const pool = await poolPromise;
  await pool.query`UPDATE Student SET name = ${newName} WHERE student_id = ${id}`;
}

exports.getUserName = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT name FROM Student WHERE student_id = ${id}`;
  return recordset[0]?.name;
};

exports.getUserGraduatedTargetAverageGrade = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT graduated_target_avg_score FROM Student WHERE student_id = ${id}`;

  return recordset[0]?.graduated_target_avg_score;
}

exports.setUserGraduatedTargetAverageGrade = async function (id, newTarget) {
  const pool = await poolPromise;
  await pool.query`UPDATE Student SET graduated_target_avg_score = ${newTarget} WHERE student_id = ${id}`;
}

exports.deleteUser = async function (id) {
  const pool = await poolPromise;
  await pool.query`DELETE FROM Friend WHERE student_id = ${id} OR friend_student_id = ${id}`;
  await pool.query`DELETE FROM Score WHERE student_id = ${id}`;
  await pool.query`DELETE FROM Student WHERE student_id = ${id}`;
}