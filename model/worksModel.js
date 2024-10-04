const { poolPromise } = require('./index'); // index.js에서 선언한 poolPromise를 가져옵니다.

// 새로운 운동 데이터 추가
exports.addWorkout = async function (workoutData) {
  const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id } = workoutData;

  const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기
  await pool.query`
    INSERT INTO workout (work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id)
    VALUES (${work_name}, ${work_weight}, ${work_count}, ${work_part}, ${work_target}, ${work_type}, ${work_day}, ${work_id});
  `;
};

// 특정 운동 데이터 조회
exports.getWorkoutById = async function (work_id) {
  const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기
  const result = await pool.query`SELECT * FROM workout WHERE work_id = ${work_id}`;
  return result.recordset;
};

// 특정 사용자의 모든 운동 데이터 조회
exports.getWorkoutsByUser = async function (user_id) {
  const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기
  const result = await pool.query`SELECT * FROM workout WHERE work_id = ${user_id}`;
  return result.recordset;
};

// 운동 데이터 수정
exports.updateWorkout = async function (workoutData) {
  const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id } = workoutData;

  const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기
  await pool.query`
    UPDATE workout
    SET work_name = ${work_name}, work_weight = ${work_weight}, work_count = ${work_count},
        work_part = ${work_part}, work_target = ${work_target}, work_type = ${work_type}, work_day = ${work_day}
    WHERE work_id = ${work_id};
  `;
};

// 운동 데이터 삭제
exports.deleteWorkout = async function (work_id) {
  const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기
  await pool.query`
    DELETE FROM workout WHERE work_id = ${work_id};
  `;
};