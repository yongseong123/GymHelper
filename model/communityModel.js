const { poolPromise } = require('./index'); // 미리 선언한 풀프라미스 가져오기

// 모든 게시글 조회
exports.getAllPosts = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM board ORDER BY regdate DESC');
        return result.recordset;
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        throw error;
    }
};

// 게시글 생성
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
        console.error("게시글 등록 오류:", error);
        throw error;
    }
};

// 게시글 수정
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
        console.error("게시글 수정 오류:", error);
        throw error;
    }
};

// 게시글 삭제
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
        console.error("게시글 삭제 오류:", error);
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
        return result.recordset[0]; // 게시글이 하나만 반환되므로 첫 번째 결과 반환
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        throw error;
    }
};

// 게시글 ID로 댓글 목록 가져오기
exports.getCommentsByPostId = async (postId) => {
    try {
        const pool = await poolPromise;
        const query = `SELECT * FROM reply WHERE board_id = @postId ORDER BY regdate ASC`;
        const result = await pool.request()
            .input('postId', postId)
            .query(query);
        return result.recordset;
    } catch (error) {
        console.error("댓글 조회 오류:", error);
        throw error;
    }
};

// 댓글 생성
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
        console.error("댓글 생성 오류:", error);
        throw error;
    }
};

// 댓글 삭제
exports.deleteComment = async (replyId) => {
    try {
        const pool = await poolPromise;
        const query = `DELETE FROM reply WHERE reply_id = @replyId`;
        await pool.request()
            .input('replyId', replyId)
            .query(query);
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        throw error;
    }
};