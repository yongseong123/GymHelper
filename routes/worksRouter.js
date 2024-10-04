const express = require('express');
const router = express.Router();
const worksController = require("../controller/worksController");
const authMiddleware = require("../middleware/authMiddleware");

// 운동 데이터 추가: POST /api/works/add
router.post('/add', authMiddleware.isLoginStatus, worksController.addWorkout);

// 특정 운동 데이터 조회: GET /api/works/:work_id
router.get('/:work_id', authMiddleware.isLoginStatus, worksController.getWorkoutById);

// 특정 사용자의 모든 운동 데이터 조회: GET /api/works/user/:user_id
router.get('/user/:user_id', authMiddleware.isLoginStatus, worksController.getWorkoutsByUser);

// 운동 데이터 수정: PUT /api/works/update
router.put('/update', authMiddleware.isLoginStatus, worksController.updateWorkout);

// 운동 데이터 삭제: DELETE /api/works/delete/:work_id
router.delete('/delete/:work_id', authMiddleware.isLoginStatus, worksController.deleteWorkout);

module.exports = router;
