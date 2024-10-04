const { poolPromise } = require('./index'); // 데이터베이스 연결 풀 불러오기

//게시글 생성
exports.createBoard = async function (boardData) {
  // boardData에서 필요한 필드들을 구조 분해 할당합니다.
  const { writer, title, content, regdate } = boardData;

  const pool = await poolPromise;

  // SQL 쿼리 실행
  await pool.query`
    INSERT INTO board (
      writer,
      title,
      content,
      regdate
    ) VALUES (
      ${writer}, 
      ${title}, 
      ${content}, 
      ${regdate}
    );
  `;
};

const { poolPromise } = require('./index'); // 데이터베이스 연결 풀 불러오기

//게시글 수정
exports.updateBoard = async function (boardData) {
  // boardData에서 필요한 필드들을 구조 분해 할당합니다.
  const { board_id, title, content, updatedate } = boardData;

  const pool = await poolPromise;

  // SQL 쿼리 실행
  await pool.query`
    UPDATE board
    SET
      title = ${title},
      content = ${content},
      updatedate = ${updatedate}
    WHERE
      board_id = ${board_id};
  `;
};

//게시글 삭제
exports.deleteBoard = async function ({ board_id }) {
    const pool = await poolPromise;
  
    // SQL 쿼리 실행
    await pool.query`
      DELETE FROM board
      WHERE board_id = ${board_id};
      `;
};