const { poolPromise } = require('./index'); // 데이터베이스 연결 풀 불러오기

// 게시글 생성 함수
exports.createBoard = async function (boardData) {
  const { writer, title, content } = boardData;
  const regdate = new Date(); // 현재 시간을 등록 날짜로 설정
  try {
      const pool = await poolPromise;
      await pool.request()
          .input('writer', writer)
          .input('title', title)
          .input('content', content)
          .input('regdate', regdate)
          .query(`
              INSERT INTO board (writer, title, content, regdate)
              VALUES (@writer, @title, @content, @regdate);
          `);
  } catch (error) {
      console.error('게시글 생성 오류:', error);
      throw error;
  }
};