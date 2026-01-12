const passport = require("passport");
const createError = require("http-errors");
const usersModel = require("../model/usersModel");
const bcrypt = require("bcrypt");

exports.signUp = async function (req, res, next) {
  try {
    const { id, password, checkedPassword, username } = req.body;
    if (!id || !password || !checkedPassword || !username) {
      return res.fail("Missing required fields", 400);
    }

    if (await usersModel.checkIdDuplication(id)) {
      return res.fail("ID already exists", 409);
    }

    if (password !== checkedPassword) {
      return res.fail("Passwords do not match", 422);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await usersModel.addNewUser({ id, hashedPassword, username });
    return res.ok({ message: "Successfully signed up!" }, 201);
  } catch (error) {
    next(error);
  }
};

exports.idCheck = async function (req, res, next) {
  try {
    if (req.body.id === undefined) {
      return res.fail("Missing required fields", 400);
    }

    if (await usersModel.checkIdDuplication(req.body.id)) {
      return res.fail("ID already exists", 409);
    }

    return res.ok({ message: "This ID is valid. ID available" });
  } catch (error) {
    next(error);
  }
};

exports.logIn = function (req, res, next) {
  if (!req.body.id || !req.body.password) {
    return res.fail("Missing required fields", 400);
  }

  passport.authenticate("local", function (err, user, userError) {
    if (err) {
      return next(createError(500, "login_error"));
    }

    if (!user) {
      return next(userError);
    }

    return req.login(user, (loginErr) => {
      if (loginErr) {
        return next(createError(500, "login_error"));
      }
      res.ok({ message: "Login successful!" }, 201);
    });
  })(req, res, next);
};

exports.logOut = function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(createError(500, "logout_error"));
    }
    return res.ok({ message: "Logout successful!" }, 201);
  });
};

exports.modifyUserInfo = async function (req, res, next) {
  try {
    if (!req.user) return res.fail("User not authenticated", 401);

    const { password, confirmPassword, username } = req.body;
    if (!password && !username) return res.fail("Missing required fields", 400);

    if (password) {
      if (password !== confirmPassword) return res.fail("Passwords do not match", 422);
      if (password.length <= 0) return res.fail("Password must be at least 0 characters long", 422);

      const hashedPassword = await bcrypt.hash(password, 12);
      await usersModel.changePassword(req.user.id, hashedPassword);
    }

    if (username) {
      if (username.length <= 0) return res.fail("Username must be at least 0 characters long", 422);
      await usersModel.changeName(req.user.id, username);
    }

    return res.ok({ message: "User info updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getUserName = async function (req, res, next) {
  try {
    if (!req.user) return res.fail("User not authenticated", 401);
    const name = await usersModel.getUserName(req.user.id);
    return res.ok({ username: name });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async function (req, res, next) {
  try {
    if (!req.user) return res.fail("User not authenticated or not found", 400);

    await usersModel.deleteUser(req.user.id);
    req.logOut(function (err) {
      if (err) {
        return next(createError(500, "logout_error"));
      }
      return res.ok({ message: "The user has been deleted and logged out successfully." }, 201);
    });
  } catch (error) {
    next(error);
  }
};