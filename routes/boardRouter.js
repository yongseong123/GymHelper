const express = require('express');
const router = express.Router();
const boardController = require("../controller/boardController");
const authMiddleware = require("../middleware/authMiddleware");

// 게시판 생성 라우트: 로그인 상태 확인 후, 게시판 생성
router.post('/createBoard', authMiddleware.isLoginStatus, boardController.createBoard);

// 게시판 수정 라우트: 로그인 상태 확인 후, 게시글 수정
router.put('/updateBoard', authMiddleware.isLoginStatus, boardController.updateBoard);

// 게시판 삭제 라우트: 로그인 상태 확인 후, 게시글 삭제
router.delete('/deleteBoard', authMiddleware.isLoginStatus, boardController.deleteBoard);

module.exports = router;