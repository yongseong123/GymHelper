const express = require('express');
const router = express.Router();
const worksController = require("../controller/worksController");
const authMiddleware = require("../middleware/authMiddleware");

router.post('/add', authMiddleware.isLoginStatus, worksController.addWorkoutRecord);

// 특정 날짜의 사용자 운동 기록 조회 엔드포인트
router.post('/myWorkouts', authMiddleware.isLoginStatus, worksController.getWorkoutsByDate);

// 운동 기록 수정 엔드포인트
router.put('/update', authMiddleware.isLoginStatus, worksController.updateWorkoutRecord);

// 운동 기록 삭제 엔드포인트
router.delete('/delete', authMiddleware.isLoginStatus, worksController.deleteWorkoutRecord);

router.post('/allWorkouts', authMiddleware.isLoginStatus, worksController.getAllWorkouts);

// 월간 운동 통계 조회 엔드포인트
router.post('/monthlyStats', authMiddleware.isLoginStatus, worksController.getMonthlyWorkoutStats);

module.exports = router;