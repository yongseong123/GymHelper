const passport = require("passport");
const local = require("./localStrategy");
const userModel = require("../model/usersModel"); // userModel 가져오기

module.exports = () => {
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, user.id); // session에 user.id 저장
    });
  });

  passport.deserializeUser(async function (id, cb) {
    try {
      console.log("Deserializing ID: ", id); // Deserializing 시 ID 값 출력
      const user = await userModel.getUserById(id); // id로 사용자 검색
      console.log("User Found: ", user); // 검색된 사용자 출력

      if (!user || user.length === 0) {
        return cb(new Error("User not found")); // 사용자 정보가 없으면 에러 반환
      }
      return cb(null, user[0]); // 사용자 객체 반환
    } catch (error) {
      return cb(error); // 에러 발생 시 에러 반환
    }
  });

  local();
};