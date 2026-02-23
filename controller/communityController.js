const communityModel = require("../model/communityModel");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

exports.getCommunityPage = async (req, res, next) => {
  try {
    const posts = await communityModel.getAllPosts();
    return res.render("community", { posts });
  } catch (error) {
    return next(error);
  }
};

exports.createPost = async (req, res) => {
  const title = normalizeText(req.body.title);
  const content = normalizeText(req.body.content);
  const writer = req.user.username;

  if (!title || !content) {
    return res.fail("Title and content are required.", 400);
  }

  try {
    await communityModel.createPost({ writer, title, content });
    return res.ok();
  } catch (error) {
    return res.fail("Failed to create post.", 500);
  }
};

exports.editPost = async (req, res) => {
  const title = normalizeText(req.body.title);
  const content = normalizeText(req.body.content);
  const postId = Number(req.params.id);

  if (!postId) {
    return res.fail("Invalid post id.", 400);
  }

  if (!title || !content) {
    return res.fail("Title and content are required.", 400);
  }

  try {
    await communityModel.updatePost(postId, { title, content });
    return res.ok();
  } catch (error) {
    return res.fail("Failed to update post.", 500);
  }
};

exports.deletePost = async (req, res) => {
  const postId = Number(req.params.id);
  if (!postId) {
    return res.fail("Invalid post id.", 400);
  }

  try {
    await communityModel.deletePost(postId);
    return res.ok();
  } catch (error) {
    return res.fail("Failed to delete post.", 500);
  }
};

exports.getPostAndComments = async (req, res) => {
  const postId = Number(req.params.id);
  if (!postId) {
    return res.fail("Invalid post id.", 400);
  }

  try {
    const [post, comments] = await Promise.all([
      communityModel.getPostById(postId),
      communityModel.getCommentsByPostId(postId),
    ]);

    return res.ok({ post, comments });
  } catch (error) {
    return res.fail("Failed to fetch post and comments.", 500);
  }
};

exports.addComment = async (req, res) => {
  const boardId = Number(req.body.board_id);
  const content = normalizeText(req.body.content);
  const writer = req.user.username;

  if (!boardId || !content) {
    return res.fail("Comment content is required.", 400);
  }

  try {
    await communityModel.createComment({ board_id: boardId, writer, content });
    return res.ok();
  } catch (error) {
    return res.fail("Failed to add comment.", 500);
  }
};

exports.deleteComment = async (req, res) => {
  const replyId = Number(req.params.id);
  if (!replyId) {
    return res.fail("Invalid comment id.", 400);
  }

  try {
    await communityModel.deleteComment(replyId);
    return res.ok();
  } catch (error) {
    return res.fail("Failed to delete comment.", 500);
  }
};
