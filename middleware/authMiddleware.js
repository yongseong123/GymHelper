const createError = require("http-errors");

exports.isLoginStatus = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(createError(401, "not_login_status_access_error"));
};

exports.isLoginStatusOrRedirect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/logIn');
};

exports.isLogoutStatus = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return next(createError(403, "not_logout_status_access_error"));
};

exports.isLogoutStatusOrRedirect = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};