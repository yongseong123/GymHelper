const worksModel = require('../model/worksModel');
const createError = require("http-errors");

// 운동 데이터 추가
exports.addWorkout = async function (req, res, next) {
  try {
    // 로그인한 사용자 ID를 가져옴
    const work_id = req.user.id; // 로그인한 사용자의 ID (req.user에서 가져옴)
    
    // 요청 본문에서 필요한 필드들을 가져옵니다.
    const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day } = req.body;

    // 필수 값 체크
    if (!work_name || !work_part || !work_day) {
      return res.status(400).json({ success: false, message: "Required fields are missing!" });
    }

    // 모델의 addWorkout 함수를 호출하여 새로운 운동 데이터 추가
    await worksModel.addWorkout({ work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id });

    // 성공적으로 추가되었음을 응답
    res.status(201).json({ success: true, message: 'Workout added successfully!' });
  } catch (error) {
    // 오류 발생 시 다음 미들웨어로 오류 전달
    next(error);
  }
};

// 모든 운동 데이터 조회
exports.getWorkoutsByUser = async function (req, res, next) {
  try {
    const user_id = req.user.id; // 로그인된 사용자의 ID 사용
    console.log("Logged-in User ID: ", user_id); // 로그인된 사용자 ID 로그 출력

    // 모델의 getWorkoutsByUser 함수 호출하여 user_id에 해당하는 운동 데이터 조회
    const workouts = await worksModel.getWorkoutsByUser(user_id);

    if (workouts && workouts.length > 0) {
      // 운동 데이터가 있을 경우 응답으로 반환
      res.status(200).json({ success: true, data: workouts });
    } else {
      // 운동 데이터가 없을 경우 404 응답
      res.status(404).json({ success: false, message: 'No workouts found for this user' });
    }
  } catch (error) {
    console.error("Error in getWorkoutsByUser: ", error); // 오류 로그 출력
    next(error); // 다음 미들웨어로 오류 전달
  }
};

// 운동 데이터 수정 차후 구현
exports.updateWorkout = async function (req, res, next) {
  try {
    const work_id = req.user.id; // 로그인된 사용자의 ID를 work_id로 사용
    const { work_num, work_weight, work_count } = req.body;

    console.log("Updating workout for work_id: ", work_id, " with work_num: ", work_num); // 로그 출력

    // 필수 값 체크: work_num, work_weight, work_count는 필수 값으로 설정
    if (!work_num || (!work_weight && !work_count)) {
      return res.status(400).json({ success: false, message: "Required fields are missing!" });
    }

    // 모델의 updateWorkout 함수를 호출하여 데이터베이스에서 해당 운동 데이터 수정
    const updated = await worksModel.updateWorkout({ work_id, work_num, work_weight, work_count });

    // 수정 결과에 따라 응답 처리
    if (updated) {
      res.status(200).json({ success: true, message: 'Workout updated successfully!' });
    } else {
      res.status(404).json({ success: false, message: 'Workout not found or not authorized to update' });
    }
  } catch (error) {
    console.error("Error in updateWorkout: ", error); // 오류 로그 출력
    next(error); // 다음 미들웨어로 오류 전달
  }
};

// 운동 데이터 삭제
exports.deleteWorkout = async function (req, res, next) {
  try {
    const work_id = req.user.id; // 로그인된 사용자의 ID를 work_id로 사용
    const { work_num } = req.body; // 삭제할 work_num을 요청 본문에서 가져옴

    console.log("Deleting workout for work_id: ", work_id, " with work_num: ", work_num); // 로그 출력

    // 필수 값 체크: work_num은 필수 값으로 설정
    if (!work_num) {
      return res.status(400).json({ success: false, message: "Required field 'work_num' is missing!" });
    }

    // 모델의 deleteWorkout 함수를 호출하여 데이터베이스에서 해당 운동 데이터 삭제
    const deleted = await worksModel.deleteWorkout(work_id, work_num);

    // 삭제 결과에 따라 응답 처리
    if (deleted) {
      res.status(200).json({ success: true, message: 'Workout deleted successfully!' });
    } else {
      res.status(404).json({ success: false, message: 'Workout not found or not authorized to delete' });
    }
  } catch (error) {
    console.error("Error in deleteWorkout: ", error); // 오류 로그 출력
    next(error); // 다음 미들웨어로 오류 전달
  }
};