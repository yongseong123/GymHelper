const { poolPromise } = require('./index'); // 데이터베이스 연결 풀 불러오기

// 게시글 생성 함수
exports.createBoard = async function (boardData) {
  const { writer, title, content, regdate } = boardData;
  const pool = await poolPromise;
  await pool.query`
    INSERT INTO board (writer, title, content, regdate)
    VALUES (${writer}, ${title}, ${content}, ${regdate});
  `;
};

// 게시글 수정 함수
exports.updateBoard = async function (boardData) {
  const { board_id, title, content, updatedate } = boardData;
  const pool = await poolPromise;
  await pool.query`
    UPDATE board
    SET title = ${title}, content = ${content}, updatedate = ${updatedate}
    WHERE board_id = ${board_id};
  `;
};

// 게시글 삭제 함수
exports.deleteBoard = async function ({ board_id }) {
  const pool = await poolPromise;
  await pool.query`
    DELETE FROM board WHERE board_id = ${board_id};
  `;
};