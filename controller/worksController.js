const worksModel = require('../model/worksModel');
const createError = require("http-errors");

// 운동 데이터 추가
exports.addWorkoutRecord = async (req, res) => {
  const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day } = req.body;
  const work_id = req.user.id; // 로그인된 사용자의 ID를 가져옴

  try {
      const workoutData = {
          work_name,
          work_weight: work_weight || null, // 무게가 입력되지 않은 경우 null 처리
          work_count,
          work_part,
          work_target: work_target || null, // 타겟이 선택되지 않은 경우 null 처리
          work_type: work_type || null, // 운동 타입이 선택되지 않은 경우 null 처리
          work_day,
          work_id
      };

      const result = await worksModel.addWorkoutRecord(workoutData);

      res.status(200).json(result); // 성공 응답 반환
  } catch (error) {
      console.error("운동 기록 추가 컨트롤러 오류:", error);
      res.status(500).json({ success: false, message: "운동 기록 추가에 실패했습니다." });
  }
};

// 특정 날짜의 사용자 운동 기록 조회 컨트롤러
exports.getWorkoutsByDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body; // 날짜는 클라이언트로부터 전달받음

  try {
      const workouts = await worksModel.getWorkoutsByDate(userId, date);
      res.status(200).json({ success: true, workouts });
  } catch (error) {
      console.error("운동 기록 조회 컨트롤러 오류:", error);
      res.status(500).json({ success: false, message: "운동 기록 조회에 실패했습니다." });
  }
};

// 운동 기록 수정 컨트롤러
exports.updateWorkoutRecord = async (req, res) => {
  const { work_num, work_day, work_name, work_weight, work_count, work_part, work_target, work_type } = req.body;
  const work_id = req.user.id; // 로그인된 사용자의 ID를 가져옴

  try {
      // 모델 함수 호출하여 운동 기록 수정
      const result = await worksModel.updateWorkoutRecord(work_num, work_day, work_id, {
          work_name, work_weight, work_count, work_part, work_target, work_type
      });
      res.status(200).json(result); // 성공 응답 반환
  } catch (error) {
      console.error("운동 기록 수정 컨트롤러 오류:", error);
      res.status(500).json({ success: false, message: "운동 기록 수정에 실패했습니다." });
  }
};

// 운동 기록 삭제 컨트롤러
exports.deleteWorkoutRecord = async (req, res) => {
  const { work_num, work_day } = req.body;
  const work_id = req.user.id; // 로그인된 사용자의 ID를 가져옴

  try {
      // 모델 함수 호출하여 운동 기록 삭제
      const result = await worksModel.deleteWorkoutRecord(work_num, work_day, work_id);
      res.status(200).json(result); // 성공 응답 반환
  } catch (error) {
      console.error("운동 기록 삭제 컨트롤러 오류:", error);
      res.status(500).json({ success: false, message: "운동 기록 삭제에 실패했습니다." });
  }
};

exports.getAllWorkouts = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const workouts = await worksModel.getAllWorkouts(userId);
      res.status(200).json({ success: true, workouts });
    } catch (error) {
      console.error("전체 운동 기록 조회 컨트롤러 오류:", error);
      res.status(500).json({ success: false, message: "전체 운동 기록 조회에 실패했습니다." });
    }
  };

  // 월간 운동 통계 조회 컨트롤러
exports.getMonthlyWorkoutStats = async (req, res) => {
  const userId = req.user.id; // 로그인된 사용자의 ID
  const { year, month } = req.body; // 클라이언트에서 년도와 월 정보를 전달받음

  try {
    const workoutStats = await worksModel.getMonthlyWorkoutStats(userId, year, month);
    res.status(200).json({ success: true, workoutStats });
  } catch (error) {
    console.error("월간 운동 통계 조회 오류:", error);
    res.status(500).json({ success: false, message: "월간 운동 통계 조회에 실패했습니다." });
  }
};