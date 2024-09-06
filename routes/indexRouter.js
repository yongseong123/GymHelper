const express = require('express');
const router = express.Router();
const indexController = require("../controller/indexController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/login", authMiddleware.isLogoutStatusOrRedirect, indexController.getLogInPage);
router.get("/signup", authMiddleware.isLogoutStatusOrRedirect, indexController.getSignUpPage);
router.get("/accountSettings", authMiddleware.isLoginStatusOrRedirect, indexController.getAccountSettingsPage);

module.exports = router;