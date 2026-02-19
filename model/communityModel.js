const { poolPromise } = require('./index');

exports.getAllPosts = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM board ORDER BY regdate DESC');
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

exports.createPost = async ({ writer, title, content }) => {
  try {
    const pool = await poolPromise;
    const insertQuery = `
      INSERT INTO board (writer, title, content, regdate)
      VALUES (@writer, @title, @content, GETDATE());
    `;
    await pool.request()
      .input('writer', writer)
      .input('title', title)
      .input('content', content)
      .query(insertQuery);
  } catch (error) {
    throw error;
  }
};

exports.updatePost = async (postId, { title, content }) => {
  try {
    const pool = await poolPromise;
    const updateQuery = `
      UPDATE board
      SET title = @title, content = @content, updatedate = GETDATE()
      WHERE board_id = @postId;
    `;
    await pool.request()
      .input('title', title)
      .input('content', content)
      .input('postId', postId)
      .query(updateQuery);
  } catch (error) {
    throw error;
  }
};

exports.deletePost = async (postId) => {
  try {
    const pool = await poolPromise;
    const deleteQuery = `
      DELETE FROM board
      WHERE board_id = @postId;
    `;
    await pool.request()
      .input('postId', postId)
      .query(deleteQuery);
  } catch (error) {
    throw error;
  }
};

exports.getPostById = async (postId) => {
  try {
    const pool = await poolPromise;
    const query = `SELECT * FROM board WHERE board_id = @postId`;
    const result = await pool.request()
      .input('postId', postId)
      .query(query);
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

exports.getCommentsByPostId = async (postId) => {
  try {
    const pool = await poolPromise;
    const query = `SELECT * FROM reply WHERE board_id = @postId ORDER BY regdate ASC`;
    const result = await pool.request()
      .input('postId', postId)
      .query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

exports.createComment = async ({ board_id, writer, content }) => {
  try {
    const pool = await poolPromise;
    const query = `
      INSERT INTO reply (board_id, writer, content, regdate)
      VALUES (@board_id, @writer, @content, GETDATE());
    `;
    await pool.request()
      .input('board_id', board_id)
      .input('writer', writer)
      .input('content', content)
      .query(query);
  } catch (error) {
    throw error;
  }
};

exports.deleteComment = async (replyId) => {
  try {
    const pool = await poolPromise;
    const query = `DELETE FROM reply WHERE reply_id = @replyId`;
    await pool.request()
      .input('replyId', replyId)
      .query(query);
  } catch (error) {
    throw error;
  }
};
