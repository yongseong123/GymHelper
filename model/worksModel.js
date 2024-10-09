const { poolPromise } = require('./index'); // index.js에서 선언한 poolPromise를 가져옵니다.

// 새로운 운동 데이터 추가
exports.addWorkoutRecord = async (workoutData) => {
  try {
      const pool = await poolPromise;
      const {
          work_name, work_weight, work_count, work_part,
          work_target, work_type, work_day, work_id
      } = workoutData;

      // work_day 기준으로 해당 날짜의 가장 큰 work_num을 조회
      const queryForMaxWorkNum = `
          SELECT ISNULL(MAX(work_num), 0) AS max_work_num
          FROM workout
          WHERE work_day = @work_day;
      `;

      // 해당 날짜의 가장 큰 work_num을 조회하고, 다음 work_num을 설정
      const result = await pool.request()
          .input('work_day', work_day)
          .query(queryForMaxWorkNum);
      
      const nextWorkNum = result.recordset[0].max_work_num + 1;

      // 운동 기록을 추가하는 쿼리문, work_num 값을 nextWorkNum으로 설정
      const query = `
          INSERT INTO workout (work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id, work_num)
          VALUES (@work_name, @work_weight, @work_count, @work_part, @work_target, @work_type, @work_day, @work_id, @work_num);
      `;

      await pool.request()
          .input('work_name', work_name)
          .input('work_weight', work_weight)
          .input('work_count', work_count)
          .input('work_part', work_part)
          .input('work_target', work_target)
          .input('work_type', work_type)
          .input('work_day', work_day)
          .input('work_id', work_id)
          .input('work_num', nextWorkNum) // 증가한 work_num 값을 설정
          .query(query);
      
      return { success: true, message: "운동 기록이 성공적으로 추가되었습니다." };
  } catch (error) {
      console.error("운동 기록 추가 오류:", error);
      throw error;
  }
};

// 특정 날짜의 사용자 운동 기록 조회 함수
exports.getWorkoutsByDate = async (userId, date) => {
  try {
      const pool = await poolPromise;
      const query = `
          SELECT * FROM workout WHERE work_id = @userId AND work_day = @date ORDER BY work_num;
      `;
      const result = await pool.request()
          .input('userId', userId)
          .input('date', date)
          .query(query);

      return result.recordset;
  } catch (error) {
      console.error("운동 기록 조회 오류:", error);
      throw error;
  }
};

// 운동 기록 수정 함수
exports.updateWorkoutRecord = async (work_num, work_day, work_id, updateData) => {
  try {
      const pool = await poolPromise;
      const { work_name, work_weight, work_count, work_part, work_target, work_type } = updateData;

      // 운동 기록 수정 쿼리문
      const query = `
          UPDATE workout 
          SET work_name = @work_name, work_weight = @work_weight, work_count = @work_count, 
              work_part = @work_part, work_target = @work_target, work_type = @work_type
          WHERE work_num = @work_num AND work_day = @work_day AND work_id = @work_id;
      `;

      await pool.request()
          .input('work_num', work_num)
          .input('work_day', work_day)
          .input('work_id', work_id)
          .input('work_name', work_name)
          .input('work_weight', work_weight)
          .input('work_count', work_count)
          .input('work_part', work_part)
          .input('work_target', work_target)
          .input('work_type', work_type)
          .query(query);

      return { success: true, message: "운동 기록이 성공적으로 수정되었습니다." };
  } catch (error) {
      console.error("운동 기록 수정 오류:", error);
      throw error;
  }
};

// 운동 기록 삭제 함수
exports.deleteWorkoutRecord = async (work_num, work_day, work_id) => {
  try {
      const pool = await poolPromise;

      // work_num, work_day, work_id 기준으로 운동 기록 삭제
      const query = `
          DELETE FROM workout 
          WHERE work_num = @work_num AND work_day = @work_day AND work_id = @work_id;
      `;

      await pool.request()
          .input('work_num', work_num)
          .input('work_day', work_day)
          .input('work_id', work_id)
          .query(query);

      return { success: true, message: "운동 기록이 성공적으로 삭제되었습니다." };
  } catch (error) {
      console.error("운동 기록 삭제 오류:", error);
      throw error;
  }
};