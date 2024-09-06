const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const userModel = require("../model/usersModel");
const createError = require("http-errors");

module.exports = () => {
  passport.use(new LocalStrategy(async (username, password, cb) => {
    try {
      const users = await userModel.getUserById(username);

      if (users.length === 0) return cb(null, false, createError(401, "not_found_id_error"));

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) return cb(null, false, createError(401, "not_match_password_error"));

      return cb(null, user);
    } catch (err) { cb(err); }
  }));
};