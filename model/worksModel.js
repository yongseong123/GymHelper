const { poolPromise } = require("./index");

exports.addWorkout = async function (workoutData) {
    // workoutData에서 필요한 필드들을 구조 분해 할당합니다.
    const {
      work_name,
      work_weight = null,  // NULL 허용 필드는 기본값으로 null을 설정
      work_count = null,
      work_part,
      work_target = null,
      work_type = null,
      work_day,
      work_id
    } = workoutData;
  
    const pool = await poolPromise;
  
    // SQL 쿼리 실행
    await pool.query`
      INSERT INTO workout (
        work_name,
        work_weight,
        work_count,
        work_part,
        work_target,
        work_type,
        work_day,
        work_id
      ) VALUES (
        ${work_name}, 
        ${work_weight}, 
        ${work_count}, 
        ${work_part}, 
        ${work_target}, 
        ${work_type}, 
        ${work_day}, 
        ${work_id}
      );
    `;
  };