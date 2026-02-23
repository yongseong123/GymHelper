const passport = require("passport");
const local = require("./localStrategy");
const userModel = require("../model/usersModel");

module.exports = () => {
  passport.serializeUser((user, cb) => {
    process.nextTick(() => {
      cb(null, user.id);
    });
  });

  passport.deserializeUser(async (id, cb) => {
    try {
      const users = await userModel.getUserById(id);

      if (!users || users.length === 0) {
        return cb(new Error("User not found"));
      }

      return cb(null, users[0]);
    } catch (error) {
      return cb(error);
    }
  });

  local();
};
