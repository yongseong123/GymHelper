const passport = require("passport");
const createError = require("http-errors");
const usersModel = require("../model/usersModel");
const bcrypt = require("bcrypt");

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

exports.signUp = async (req, res, next) => {
  try {
    const id = normalizeText(req.body.id);
    const username = normalizeText(req.body.username);
    const password = req.body.password;
    const checkedPassword = req.body.checkedPassword;

    if (!id || !password || !checkedPassword || !username) {
      return res.fail("Missing required fields", 400);
    }

    if (!/^[a-zA-Z0-9]{5,20}$/.test(id)) {
      return res.fail("ID must be 5-20 characters of letters and numbers only", 422);
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

exports.idCheck = async (req, res, next) => {
  try {
    const id = normalizeText(req.body.id);
    if (!id) {
      return res.fail("Missing required fields", 400);
    }

    if (!/^[a-zA-Z0-9]{5,20}$/.test(id)) {
      return res.fail("ID must be 5-20 characters of letters and numbers only", 422);
    }

    if (await usersModel.checkIdDuplication(id)) {
      return res.fail("ID already exists", 409);
    }

    return res.ok({ message: "This ID is valid. ID available" });
  } catch (error) {
    next(error);
  }
};

exports.logIn = (req, res, next) => {
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

exports.logOut = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(createError(500, "logout_error"));
    }
    return res.ok({ message: "Logout successful!" }, 201);
  });
};

exports.modifyUserInfo = async (req, res, next) => {
  try {
    if (!req.user) return res.fail("User not authenticated", 401);

    const nextUsername = normalizeText(req.body.username);
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!password && !nextUsername) {
      return res.fail("Missing required fields", 400);
    }

    if (password) {
      if (!confirmPassword) return res.fail("Confirm password is required", 400);
      if (password !== confirmPassword) return res.fail("Passwords do not match", 422);

      const hashedPassword = await bcrypt.hash(password, 12);
      await usersModel.changePassword(req.user.id, hashedPassword);
    }

    if (nextUsername) {
      await usersModel.changeName(req.user.id, nextUsername);
    }

    return res.ok({ message: "User info updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getUserName = async (req, res, next) => {
  try {
    if (!req.user) return res.fail("User not authenticated", 401);
    const name = await usersModel.getUserName(req.user.id);
    return res.ok({ username: name });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (!req.user) return res.fail("User not authenticated or not found", 400);

    await usersModel.deleteUser(req.user.id);
    req.logOut((err) => {
      if (err) {
        return next(createError(500, "logout_error"));
      }
      return res.ok({ message: "The user has been deleted and logged out successfully." }, 201);
    });
  } catch (error) {
    next(error);
  }
};
