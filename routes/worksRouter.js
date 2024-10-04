const express = require('express');
const router = express.Router();
const worksController = require("../controller/worksController");
const authMiddleware = require("../middleware/authMiddleware");

//운동추가
router.post('/addWorkout', authMiddleware.isLoginStatus, worksController.addWorkout);

module.exports = router;