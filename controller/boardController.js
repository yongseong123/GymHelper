const createError = require("http-errors");
const boardModel = require('../model/boardModel');
const bcrypt = require("bcrypt");

// 게시글 작성
exports.createBoard = async (req, res) => {
  try {
    // 클라이언트로부터 받은 username을 writer로 사용
    const { username, title, content } = req.body;

    if (!username) {
      console.log('사용자 이름이 제공되지 않았습니다.');
      return res.status(400).send('로그인 상태에서만 게시글을 작성할 수 있습니다.');
    }

    const regdate = new Date(); // 현재 시간을 등록 날짜로 설정

    console.log("작성자 정보:", username);

    // 게시글 데이터 생성
    await boardModel.createBoard({ writer: username, title, content, regdate });

    res.status(200).send('게시글이 등록되었습니다!');
  } catch (error) {
    console.error('게시글 생성 오류:', error);
    res.status(500).send('게시글 등록 실패');
  }
};