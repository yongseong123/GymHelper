const express = require('express');
const router = express.Router();
const worksController = require("../controller/worksController");
const authMiddleware = require("../middleware/authMiddleware");

router.post('/add', authMiddleware.isLoginStatus, worksController.addWorkoutRecord);
router.post('/myWorkouts', authMiddleware.isLoginStatus, worksController.getWorkoutsByDate);
router.put('/update', authMiddleware.isLoginStatus, worksController.updateWorkoutRecord);
router.delete('/delete', authMiddleware.isLoginStatus, worksController.deleteWorkoutRecord);
router.post('/allWorkouts', authMiddleware.isLoginStatus, worksController.getAllWorkouts);
router.post('/monthlyStats', authMiddleware.isLoginStatus, worksController.getMonthlyWorkoutStats);
router.post('/partStats', authMiddleware.isLoginStatus, worksController.getPartStats);

module.exports = router;