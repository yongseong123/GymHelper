// passport/index.js
const passport = require("passport");
const local = require("./localStrategy");
const userModel = require("../model/usersModel"); // userModel 모듈을 가져옵니다.

module.exports = () => {
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, user.id); // 세션에 user.id 저장
    });
  });

  passport.deserializeUser(async function (id, cb) {
    try {
      const user = await userModel.getUserById(id); // userModel을 이용해 id로 사용자 검색
      if (user.length === 0) return cb(new Error("User not found"));
      return cb(null, user[0]); // 사용자 객체 반환
    } catch (error) {
      return cb(error);
    }
  });

  local();
};
