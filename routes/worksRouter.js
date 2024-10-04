const express = require('express');
const router = express.Router();
const worksController = require("../controller/worksController");
const authMiddleware = require("../middleware/authMiddleware");

// 운동 데이터 추가: POST /api/works/add
router.post('/add', authMiddleware.isLoginStatus, worksController.addWorkout);

// 특정 사용자의 모든 운동 데이터 조회: 로그인 상태 확인 후 조회
router.post('/user', authMiddleware.isLoginStatus, worksController.getWorkoutsByUser);

// 운동 데이터 수정: PUT /api/works/update 
router.post('/update', authMiddleware.isLoginStatus, worksController.updateWorkout);

// 운동 데이터 삭제: DELETE /api/works/delete/:work_id
router.post('/delete', authMiddleware.isLoginStatus, worksController.deleteWorkout);

module.exports = router;