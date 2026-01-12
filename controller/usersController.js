const passport = require("passport");
const createError = require("http-errors");
const usersModel = require("../model/usersModel");
const bcrypt = require("bcrypt");

exports.signUp = async function (req, res, next) {
  try {
    const { id, password, checkedPassword, username } = req.body;
    if (!id || !password || !checkedPassword || !username) {
      return next(createError(400, "Missing required fields"));
    }

    if (await usersModel.checkIdDuplication(id)) return next(createError(409, "ID already exists"));

    if (password !== checkedPassword) return next(createError(422, "Passwords do not match"));

    const hashedPassword = await bcrypt.hash(password, 12);
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
};

exports.logIn = function (req, res, next) {
  if (!req.body.id || !req.body.password) {
    return next(createError(400, "Missing required fields"));
  }

  passport.authenticate("local", function (err, user, userError) {
    if (err) {
      console.error("Passport Error: ", err);
      return next(createError(500, "login_error"));
    }

    if (!user) {
      console.error("User Error: ", userError);
      return next(userError);
    }

    return req.login(user, (err) => {
      if (err) {
        console.error("Login Error: ", err);
        return next(createError(500, "login_error"));
      }
      res.status(201).json({ message: "Login successful!" });
    });
  })(req, res, next);
};

exports.logOut = function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(createError(500, "logout_error"));
    }
    return res.status(201).json({ message: "Logout successful!" });
  });
};

exports.modifyUserInfo = async function (req, res, next) {
  try {
    if (!req.user) return next(createError(401, "User not authenticated"));

    const { password, confirmPassword, username } = req.body;
    if (!password && !username) return next(createError(400, "Missing required fields"));

    if (password) {
      if (password !== confirmPassword) return next(createError(422, "Passwords do not match"));
      if (password.length <= 0) return next(createError(422, "Password must be at least 0 characters long"));

      const hashedPassword = await bcrypt.hash(password, 12);
      await usersModel.changePassword(req.user.id, hashedPassword);
    }

    if (username) {
      if (username.length <= 0) return next(createError(422, "Username must be at least 0 characters long"));
      await usersModel.changeName(req.user.id, username);
    }

    return res.status(200).json({ message: "User info updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getUserName = async function (req, res, next) {
  try {
    if (!req.user) return next(createError(401, "User not authenticated"));
    const name = await usersModel.getUserName(req.user.id);
    return res.status(200).json({ username: name });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async function (req, res, next) {
  try {
    if (!req.user) return next(createError(400, "User not authenticated or not found"));

    await usersModel.deleteUser(req.user.id);
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
