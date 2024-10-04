const { poolPromise } = require('./index'); // index.js에서 선언한 poolPromise를 가져옵니다.

// 새로운 운동 데이터 추가
exports.addWorkout = async function (workoutData) {
  const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id } = workoutData;

  try {
    const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기

    // 각 사용자별 work_num 값을 1부터 증가하도록 설정
    const { recordset: maxWorkNumResult } = await pool.query`
      SELECT ISNULL(MAX(work_num), 0) + 1 AS next_work_num 
      FROM workout 
      WHERE work_id = ${work_id};
    `;

    const next_work_num = maxWorkNumResult[0].next_work_num;

    // 새로운 운동 데이터 삽입 시 work_num 값을 설정
    await pool.query`
      INSERT INTO workout (work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id, work_num)
      VALUES (${work_name}, ${work_weight}, ${work_count}, ${work_part}, ${work_target}, ${work_type}, ${work_day}, ${work_id}, ${next_work_num});
    `;
    console.log("Workout added successfully with work_num: ", next_work_num);
  } catch (error) {
    console.error("Database query error in addWorkout: ", error); // 쿼리 실행 중 오류 로그 출력
    throw error;
  }
};

// 특정 사용자의 모든 운동 데이터 조회
exports.getWorkoutsByUser = async function (user_id) {
  try {
    const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기
    console.log("Querying workouts for user_id: ", user_id); // 로그 출력

    // 사용자 ID와 일치하는 모든 운동 데이터를 조회
    const { recordset } = await pool.query`
      SELECT work_id, work_name, work_weight, work_count, work_part, work_target, work_type, work_day
      FROM workout
      WHERE work_id = ${user_id};
    `;

    console.log("Query Result: ", recordset); // 쿼리 결과 로그 출력
    return recordset; // 조회된 운동 데이터 반환
  } catch (error) {
    console.error("Database query error in getWorkoutsByUser: ", error); // 쿼리 실행 중 오류 로그 출력
    throw error; // 오류 발생 시 호출자에게 오류 전달
  }
};

//운동 데이터 수정 차후 구현
exports.updateWorkout = async function (workoutData) {
  const { work_id, work_num, work_weight, work_count } = workoutData;

  try {
    const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기

    // 수정할 필드가 있는지 체크하고 해당 필드만 업데이트
    let query = 'UPDATE workout SET ';
    const params = [];

    if (work_weight !== undefined) {
      query += 'work_weight = @work_weight ';
      params.push({ name: 'work_weight', value: work_weight });
    }

    if (work_count !== undefined) {
      if (params.length > 0) query += ', '; // 이전에 추가된 필드가 있으면 쉼표 추가
      query += 'work_count = @work_count ';
      params.push({ name: 'work_count', value: work_count });
    }

    query += 'WHERE work_id = @work_id AND work_num = @work_num';
    params.push({ name: 'work_id', value: work_id });
    params.push({ name: 'work_num', value: work_num });

    console.log("Executing Query: ", query); // 쿼리 로그 출력

    const poolRequest = pool.request();

    // 각 매개변수 설정
    params.forEach((param) => poolRequest.input(param.name, param.value));

    const result = await poolRequest.query(query); // 쿼리 실행
    console.log("Query Result: ", result); // 쿼리 결과 로그 출력

    // 쿼리 실행 결과가 성공적이면 true 반환
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database query error in updateWorkout: ", error); // 쿼리 실행 중 오류 로그 출력
    throw error; // 오류 발생 시 호출자에게 오류 전달
  }
};

// 운동 데이터 삭제
exports.deleteWorkout = async function (work_id, work_num) {
  try {
    const pool = await poolPromise; // 데이터베이스 연결 풀 가져오기

    // 운동 데이터를 삭제하는 쿼리
    const query = `
      DELETE FROM workout
      WHERE work_id = @work_id AND work_num = @work_num;
    `;

    console.log("Executing Query: ", query); // 쿼리 로그 출력

    const result = await pool.request()
      .input('work_id', work_id)
      .input('work_num', work_num)
      .query(query);

    console.log("Query Result: ", result); // 쿼리 결과 로그 출력

    // 쿼리 실행 결과가 성공적이면 true 반환
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database query error in deleteWorkout: ", error); // 쿼리 실행 중 오류 로그 출력
    throw error; // 오류 발생 시 호출자에게 오류 전달
  }
};