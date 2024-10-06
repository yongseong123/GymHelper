const communityModel = require('../model/communityModel');

// 커뮤니티 메인 페이지 렌더링
exports.getCommunityPage = async (req, res) => {
    try {
        const posts = await communityModel.getAllPosts();
        res.render('community', { posts });
    } catch (error) {
        console.error("커뮤니티 페이지 로드 오류:", error);
        res.status(500).send("서버 오류가 발생했습니다.");
    }
};

// 게시글 생성
exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const writer = req.user.username; // 로그인된 사용자의 이름

    if (!title || !content) {
        return res.status(400).json({ success: false, message: "제목과 내용을 입력해주세요." });
    }

    try {
        await communityModel.createPost({ writer, title, content });
        res.json({ success: true });
    } catch (error) {
        console.error("게시글 등록 오류:", error);
        res.status(500).json({ success: false, message: "게시글 등록에 실패했습니다." });
    }
};

// 게시글 수정
exports.editPost = async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;

    try {
        await communityModel.updatePost(postId, { title, content });
        res.json({ success: true });
    } catch (error) {
        console.error("게시글 수정 오류:", error);
        res.status(500).json({ success: false, message: "게시글 수정에 실패했습니다." });
    }
};

// 게시글 삭제
exports.deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        await communityModel.deletePost(postId);
        res.json({ success: true });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        res.status(500).json({ success: false, message: "게시글 삭제에 실패했습니다." });
    }
};

// 게시글 및 댓글 가져오기
exports.getPostAndComments = async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await communityModel.getPostById(postId);
        const comments = await communityModel.getCommentsByPostId(postId);
        res.json({ success: true, post, comments });
    } catch (error) {
        console.error("게시글 및 댓글 가져오기 오류:", error);
        res.status(500).json({ success: false, message: "게시글 및 댓글을 가져오는 데 실패했습니다." });
    }
};

// 댓글 작성
exports.addComment = async (req, res) => {
    const { board_id, content } = req.body;
    const writer = req.user.username; // 로그인된 사용자 이름

    try {
        await communityModel.createComment({ board_id, writer, content });
        res.json({ success: true });
    } catch (error) {
        console.error("댓글 등록 오류:", error);
        res.status(500).json({ success: false, message: "댓글 등록에 실패했습니다." });
    }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
    const replyId = req.params.id;

    try {
        await communityModel.deleteComment(replyId);
        res.json({ success: true });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        res.status(500).json({ success: false, message: "댓글 삭제에 실패했습니다." });
    }
};