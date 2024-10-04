const createError = require("http-errors");
const boardModel = require('../model/boardModel');
const bcrypt = require("bcrypt");

//게시글 생성
exports.createBoard = async function (req, res, next) {
  try {
    // 클라이언트로부터 전달된 게시판 데이터를 가져옵니다.
    const { writer, title, content } = req.body;

    // 필수 값 체크
    if (!writer || !title || !content) {
      return res.status(400).json({ success: false, message: "Required fields are missing!" });
    }

    // 현재 시간을 등록일자로 사용
    const regdate = new Date();

    // 모델을 통해 board 데이터 추가
    await boardModel.createBoard({
      writer,
      title,
      content,
      regdate,
    });

    // 성공 메시지 반환
    res.status(201).json({ success: true, message: 'Board created successfully' });
  } catch (error) {
    // 오류가 발생하면 다음 미들웨어로 넘겨서 처리
    next(error);
  }
};

//게시글 수정
exports.updateBoard = async function (req, res, next) {
    try {
      // 클라이언트로부터 전달된 게시판 데이터를 가져옵니다.
      const { board_id, title, content } = req.body;
  
      // 필수 값 체크
      if (!board_id || !title || !content) {
        return res.status(400).json({ success: false, message: "Required fields are missing!" });
      }
  
      // 현재 시간을 수정일자로 사용
      const updatedate = new Date();
  
      // 모델을 통해 board 데이터 업데이트 요청
      await boardModel.updateBoard({
        board_id,
        title,
        content,
        updatedate,
      });
  
      // 성공 메시지 반환
      res.status(200).json({ success: true, message: 'Board updated successfully' });
    } catch (error) {
      // 오류가 발생하면 다음 미들웨어로 넘겨서 처리
      next(error);
    }
};

//게시글 삭제
exports.deleteBoard = async function (req, res, next) {
    try {
      const { board_id } = req.body; // 클라이언트로부터 전달된 board_id 가져오기
  
      if (!board_id) {
        return res.status(400).json({ success: false, message: "Board ID is required!" });
      }
  
      // 모델을 통해 board 데이터 삭제 요청
      await boardModel.deleteBoard({ board_id });
  
      // 성공 메시지 반환
      res.status(200).json({ success: true, message: 'Board deleted successfully' });
    } catch (error) {
      next(error); // 오류 발생 시 다음 미들웨어로 전달
    }
  };