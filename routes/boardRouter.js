const express = require('express');
const router = express.Router();
const boardController = require("../controller/boardController");
const authMiddleware = require("../middleware/authMiddleware");

// 게시판 생성 라우트: 로그인 상태 확인 후, 게시판 생성
router.post('/createBoard', authMiddleware.isLoginStatus, boardController.createBoard);

module.exports = router;