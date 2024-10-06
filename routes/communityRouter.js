const express = require('express');
const router = express.Router();
const communityController = require('../controller/communityController');

// 커뮤니티 메인 페이지
router.get('/', communityController.getCommunityPage);

// 게시글 등록 처리
router.post('/create', communityController.createPost);

// 게시글 및 댓글 가져오기
router.get('/getPostAndComments/:id', communityController.getPostAndComments);

// 댓글 등록 처리
router.post('/addComment', communityController.addComment);

// 댓글 삭제 처리
router.delete('/deleteComment/:id', communityController.deleteComment);

// 게시글 수정 처리
router.put('/edit/:id', communityController.editPost);

// 게시글 삭제 처리
router.delete('/delete/:id', communityController.deletePost);

module.exports = router;
