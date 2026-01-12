const express = require('express');
const router = express.Router();
const communityController = require('../controller/communityController');
const authMiddleware = require("../middleware/authMiddleware");

router.get('/', communityController.getCommunityPage);
router.post('/create', authMiddleware.isLoginStatus, communityController.createPost);
router.get('/getPostAndComments/:id', communityController.getPostAndComments);
router.post('/addComment', authMiddleware.isLoginStatus, communityController.addComment);
router.delete('/deleteComment/:id', authMiddleware.isLoginStatus, communityController.deleteComment);
router.put('/edit/:id', authMiddleware.isLoginStatus, communityController.editPost);
router.delete('/delete/:id', authMiddleware.isLoginStatus, communityController.deletePost);

module.exports = router;