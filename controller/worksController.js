const worksModel = require('../model/worksModel');
const createError = require("http-errors");

// 운동 데이터 추가
exports.addWorkout = async function (req, res, next) {
  try {
    // 요청 본문에서 필요한 필드들을 가져옵니다.
    const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id } = req.body;

    // 필수 값 체크
    if (!work_name || !work_part || !work_day || !work_id) {
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

// 특정 운동 데이터 조회
exports.getWorkoutById = async function (req, res, next) {
  try {
    const { work_id } = req.params; // URL 파라미터에서 work_id 가져오기

    // work_id가 없을 경우 오류 반환
    if (!work_id) {
      return res.status(400).json({ success: false, message: "Workout ID is required!" });
    }

    // 모델의 getWorkoutById 함수 호출
    const workout = await worksModel.getWorkoutById(work_id);

    // 운동 데이터가 존재하지 않을 경우 오류 반환
    if (workout.length === 0) {
      return res.status(404).json({ success: false, message: "Workout not found!" });
    }

    // 운동 데이터를 응답
    res.status(200).json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// 특정 사용자의 모든 운동 데이터 조회
exports.getWorkoutsByUser = async function (req, res, next) {
  try {
    const { user_id } = req.params; // URL 파라미터에서 user_id 가져오기

    // user_id가 없을 경우 오류 반환
    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required!" });
    }

    // 모델의 getWorkoutsByUser 함수 호출
    const workouts = await worksModel.getWorkoutsByUser(user_id);

    // 운동 데이터가 존재하지 않을 경우 오류 반환
    if (workouts.length === 0) {
      return res.status(404).json({ success: false, message: "No workouts found for this user!" });
    }

    // 운동 데이터를 응답
    res.status(200).json({ success: true, data: workouts });
  } catch (error) {
    next(error);
  }
};

// 운동 데이터 수정
exports.updateWorkout = async function (req, res, next) {
  try {
    const { work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id } = req.body;

    // 필수 값 체크
    if (!work_id || !work_name || !work_part || !work_day) {
      return res.status(400).json({ success: false, message: "Required fields are missing!" });
    }

    // 모델의 updateWorkout 함수 호출
    await worksModel.updateWorkout({ work_name, work_weight, work_count, work_part, work_target, work_type, work_day, work_id });

    // 성공적으로 수정되었음을 응답
    res.status(200).json({ success: true, message: 'Workout updated successfully!' });
  } catch (error) {
    next(error);
  }
};

// 운동 데이터 삭제
exports.deleteWorkout = async function (req, res, next) {
  try {
    const { work_id } = req.params; // URL 파라미터에서 work_id 가져오기

    // work_id가 없을 경우 오류 반환
    if (!work_id) {
      return res.status(400).json({ success: false, message: "Workout ID is required!" });
    }

    // 모델의 deleteWorkout 함수 호출
    await worksModel.deleteWorkout(work_id);

    // 성공적으로 삭제되었음을 응답
    res.status(200).json({ success: true, message: 'Workout deleted successfully!' });
  } catch (error) {
    next(error);
  }
};