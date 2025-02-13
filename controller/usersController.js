const passport = require("passport");
const createError = require("http-errors");
const usersModel = require("../model/usersModel");
const bcrypt = require("bcrypt");

exports.signUp = async function (req, res, next) {
  try {
    // 필수 입력 필드 검사
    const { id, password, checkedPassword, username } = req.body;
    if (!id || !password || !checkedPassword || !username) {
      return next(createError(400, "Missing required fields"));
    }

    // ID 중복 검사
    if (await usersModel.checkIdDuplication(id)) return next(createError(409, "ID already exists"));

    // 비밀번호 일치성 검사
    if (password !== checkedPassword) return next(createError(422, "Passwords do not match"));

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12); // 비밀번호 해싱 (비동기 함수)

    // 새 사용자 추가
    await usersModel.addNewUser({ id, hashedPassword, username });
    return res.status(201).json({ message: "Successfully signed up!" });
  } catch (error) {
    next(error);
  }
};


exports.idCheck = async function (req, res, next) {
    try {
        if (req.body.id === undefined) return next(createError(400, "Missing required fields"));
        if (await usersModel.checkIdDuplication(req.body.id)) return res.status(409).json({ message: "ID already exists" });

        return res.status(200).json({ message: "This ID is valid. ID available" });
    } catch (error) {
        next(error);
    }
}

//로그인
exports.logIn = function (req, res, next) {
  if (!req.body.id || !req.body.password) {
    return next(createError(400, "Missing required fields"));
  }

  console.log("ID: ", req.body.id); // 입력된 ID 확인
  console.log("Password: ", req.body.password); // 입력된 Password 확인

  passport.authenticate("local", function (err, user, userError) {
    if (err) {
      console.error("Passport Error: ", err); // Passport 에러 로그 추가
      return next(createError(500, "login_error"));
    }

    if (!user) {
      console.error("User Error: ", userError); // 사용자를 찾지 못한 에러 로그 추가
      return next(userError);
    }

    return req.login(user, (err) => {
      if (err) {
        console.error("Login Error: ", err); // 로그인 에러 로그 추가
        return next(createError(500, "login_error"));
      }
      res.status(201).json({ message: "Login successful!" });
    });
  })(req, res, next);
};

//로그아웃
exports.logOut = function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(createError(500, "logout_error"));
    }
    return res.status(201).json({ message: "Logout successful!" });
  });
};

//회원정보 수정
exports.modifyUserInfo = async function (req, res, next) {
  const { password, confirmPassword, username } = req.body;
  if (!password && !username) return next(createError(400, "Missing required fields"));

  if (password) {
    if (password !== confirmPassword) return next(createError(422, "Passwords do not match"));
    if (password.length <= 0) return next(createError(422, "Password must be at least 0 characters long"));

    const hashedPassword = await bcrypt.hash(password, 12); // 비밀번호 해싱 (비동기 함수)
    await usersModel.changePassword(req.user, hashedPassword);
  }
  if (username) {
    if (username.length <= 0) return next(createError(422, "Username must be at least 0 characters long"));

    await usersModel.changeName(req.user, username);
    res.status(200).json({ message: "User info updated successfully" });
  }
}

//회원 이름 가져오기
exports.getUserName = async function (id) {
  try {
    const name = await usersModel.getUserName(id);
    return name;
  } catch (error) {
    throw error;
  }
}

//회원 탈퇴
exports.deleteUser = async function (req, res, next) {
  try {
    console.log("Request User: ", req.user); // req.user 값 출력하여 확인
    if (!req.user) return next(createError(400, "User not authenticated or not found"));

    await usersModel.deleteUser(req.user.id); // req.user.id로 사용자를 삭제
    req.logOut(function (err) {
      if (err) {
        return next(createError(500, "logout_error"));
      }
      return res.status(201).json({ success: true, message: "The user has been deleted and logged out successfully." });
    });
  } catch (error) {
    next(error);
  }
};