const communityModel = require('../model/communityModel');

exports.getCommunityPage = async (req, res) => {
  try {
    const posts = await communityModel.getAllPosts();
    res.render('community', { posts });
  } catch (error) {
    console.error("커뮤니티 페이지 로드 오류:", error);
    res.status(500).send("서버 오류가 발생했습니다.");
  }
};

exports.createPost = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }

  const { title, content } = req.body;
  const trimmedTitle = title ? title.trim() : "";
  const trimmedContent = content ? content.trim() : "";
  const writer = req.user.username;

  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).json({ success: false, message: "제목과 내용을 입력해주세요." });
  }

  try {
    await communityModel.createPost({ writer, title: trimmedTitle, content: trimmedContent });
    res.json({ success: true });
  } catch (error) {
    console.error("게시글 등록 오류:", error);
    res.status(500).json({ success: false, message: "게시글 등록에 실패했습니다." });
  }
};

exports.editPost = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }

  const { title, content } = req.body;
  const trimmedTitle = title ? title.trim() : "";
  const trimmedContent = content ? content.trim() : "";
  const postId = req.params.id;

  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).json({ success: false, message: "제목과 내용을 입력해주세요." });
  }

  try {
    await communityModel.updatePost(postId, { title: trimmedTitle, content: trimmedContent });
    res.json({ success: true });
  } catch (error) {
    console.error("게시글 수정 오류:", error);
    res.status(500).json({ success: false, message: "게시글 수정에 실패했습니다." });
  }
};

exports.deletePost = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }

  const postId = req.params.id;

  try {
    await communityModel.deletePost(postId);
    res.json({ success: true });
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    res.status(500).json({ success: false, message: "게시글 삭제에 실패했습니다." });
  }
};

exports.getPostAndComments = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await communityModel.getPostById(postId);
    const comments = await communityModel.getCommentsByPostId(postId);
    res.json({ success: true, post, comments });
  } catch (error) {
    console.error("게시글/댓글 조회 오류:", error);
    res.status(500).json({ success: false, message: "게시글 및 댓글 조회에 실패했습니다." });
  }
};

exports.addComment = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }

  const { board_id, content } = req.body;
  const trimmedContent = content ? content.trim() : "";
  const writer = req.user.username;

  if (!board_id || !trimmedContent) {
    return res.status(400).json({ success: false, message: "댓글 내용을 입력해주세요." });
  }

  try {
    await communityModel.createComment({ board_id, writer, content: trimmedContent });
    res.json({ success: true });
  } catch (error) {
    console.error("댓글 등록 오류:", error);
    res.status(500).json({ success: false, message: "댓글 등록에 실패했습니다." });
  }
};

exports.deleteComment = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }

  const replyId = req.params.id;

  try {
    await communityModel.deleteComment(replyId);
    res.json({ success: true });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    res.status(500).json({ success: false, message: "댓글 삭제에 실패했습니다." });
  }
};
