const createError = require("http-errors");
const worksModel = require("../model/worksModel");
const bcrypt = require("bcrypt");

exports.addWorkout = async function (req, res, next) {
    try {
      // 클라이언트로부터 전달된 운동 데이터를 가져옵니다.
      const workoutData = req.body;
  
      // 모델을 통해 workout 데이터 추가
      await worksModel.addWorkout(workoutData);
  
      // 성공적으로 데이터가 추가되었음을 응답
      res.status(201).json({ success: true, message: 'Workout added successfully' });
    } catch (error) {
      // 오류가 발생하면 다음 미들웨어로 넘겨서 처리
      next(error);
    }
  };