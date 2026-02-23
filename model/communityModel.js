const { getPoolPromise } = require("./index");

exports.getAllPosts = async () => {
  const pool = await getPoolPromise();
  const result = await pool.request().query("SELECT * FROM board ORDER BY regdate DESC");
  return result.recordset;
};

exports.createPost = async ({ writer, title, content }) => {
  const pool = await getPoolPromise();
  await pool.request()
    .input("writer", writer)
    .input("title", title)
    .input("content", content)
    .query(`
      INSERT INTO board (writer, title, content, regdate)
      VALUES (@writer, @title, @content, GETDATE());
    `);
};

exports.updatePost = async (postId, { title, content }) => {
  const pool = await getPoolPromise();
  await pool.request()
    .input("title", title)
    .input("content", content)
    .input("postId", postId)
    .query(`
      UPDATE board
      SET title = @title, content = @content, updatedate = GETDATE()
      WHERE board_id = @postId;
    `);
};

exports.deletePost = async (postId) => {
  const pool = await getPoolPromise();
  await pool.request()
    .input("postId", postId)
    .query(`
      DELETE FROM board
      WHERE board_id = @postId;
    `);
};

exports.getPostById = async (postId) => {
  const pool = await getPoolPromise();
  const result = await pool.request()
    .input("postId", postId)
    .query("SELECT * FROM board WHERE board_id = @postId");

  return result.recordset[0];
};

exports.getCommentsByPostId = async (postId) => {
  const pool = await getPoolPromise();
  const result = await pool.request()
    .input("postId", postId)
    .query("SELECT * FROM reply WHERE board_id = @postId ORDER BY regdate ASC");

  return result.recordset;
};

exports.createComment = async ({ board_id, writer, content }) => {
  const pool = await getPoolPromise();
  await pool.request()
    .input("board_id", board_id)
    .input("writer", writer)
    .input("content", content)
    .query(`
      INSERT INTO reply (board_id, writer, content, regdate)
      VALUES (@board_id, @writer, @content, GETDATE());
    `);
};

exports.deleteComment = async (replyId) => {
  const pool = await getPoolPromise();
  await pool.request()
    .input("replyId", replyId)
    .query("DELETE FROM reply WHERE reply_id = @replyId");
};
