const express = require('express');
const router = express.Router();
const indexController = require("../controller/indexController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/work");
  }
  return res.redirect("/logIn");
});

router.get("/work", authMiddleware.isLoginStatusOrRedirect, (req, res) => {
  res.render("work");
});

router.get("/login", authMiddleware.isLogoutStatusOrRedirect, indexController.getLogInPage);
router.get("/logIn", authMiddleware.isLogoutStatusOrRedirect, indexController.getLogInPage);
router.get("/signup", authMiddleware.isLogoutStatusOrRedirect, indexController.getSignUpPage);
router.get("/signUp", authMiddleware.isLogoutStatusOrRedirect, indexController.getSignUpPage);
router.get("/accountSettings", authMiddleware.isLoginStatusOrRedirect, indexController.getAccountSettingsPage);

module.exports = router;
