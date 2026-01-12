const communityModel = require('../model/communityModel');

exports.getCommunityPage = async (req, res) => {
  try {
    const posts = await communityModel.getAllPosts();
    res.render('community', { posts });
  } catch (error) {
    console.error("Community page load error:", error);
    res.status(500).send("Server error");
  }
};

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const trimmedTitle = title ? title.trim() : "";
  const trimmedContent = content ? content.trim() : "";
  const writer = req.user.username;

  if (!trimmedTitle || !trimmedContent) {
    return res.fail("Title and content are required.", 400);
  }

  try {
    await communityModel.createPost({ writer, title: trimmedTitle, content: trimmedContent });
    res.ok();
  } catch (error) {
    console.error("Create post error:", error);
    res.fail("Failed to create post.", 500);
  }
};

exports.editPost = async (req, res) => {
  const { title, content } = req.body;
  const trimmedTitle = title ? title.trim() : "";
  const trimmedContent = content ? content.trim() : "";
  const postId = req.params.id;

  if (!trimmedTitle || !trimmedContent) {
    return res.fail("Title and content are required.", 400);
  }

  try {
    await communityModel.updatePost(postId, { title: trimmedTitle, content: trimmedContent });
    res.ok();
  } catch (error) {
    console.error("Edit post error:", error);
    res.fail("Failed to update post.", 500);
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    await communityModel.deletePost(postId);
    res.ok();
  } catch (error) {
    console.error("Delete post error:", error);
    res.fail("Failed to delete post.", 500);
  }
};

exports.getPostAndComments = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await communityModel.getPostById(postId);
    const comments = await communityModel.getCommentsByPostId(postId);
    res.ok({ post, comments });
  } catch (error) {
    console.error("Get post/comments error:", error);
    res.fail("Failed to fetch post and comments.", 500);
  }
};

exports.addComment = async (req, res) => {
  const { board_id, content } = req.body;
  const trimmedContent = content ? content.trim() : "";
  const writer = req.user.username;

  if (!board_id || !trimmedContent) {
    return res.fail("Comment content is required.", 400);
  }

  try {
    await communityModel.createComment({ board_id, writer, content: trimmedContent });
    res.ok();
  } catch (error) {
    console.error("Add comment error:", error);
    res.fail("Failed to add comment.", 500);
  }
};

exports.deleteComment = async (req, res) => {
  const replyId = req.params.id;

  try {
    await communityModel.deleteComment(replyId);
    res.ok();
  } catch (error) {
    console.error("Delete comment error:", error);
    res.fail("Failed to delete comment.", 500);
  }
};