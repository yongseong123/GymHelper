const express = require('express');
const router = express.Router();
const indexController = require("../controller/indexController");
const authMiddleware = require("../middleware/authMiddleware");

// 루트 경로 처리: 로그인 상태에 따라 /work 또는 /logIn으로 리다이렉트
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect("/work"); // 로그인된 상태라면 /work로 이동
    } else {
      return res.redirect("/login"); // 로그인되지 않은 상태라면 /login으로 이동
    }
  });

router.get("/work", authMiddleware.isLoginStatusOrRedirect, (req, res) => {
    res.render("work"); // views 폴더의 work.ejs 파일을 렌더링 (메인 페이지)
  });

router.get("/login", authMiddleware.isLogoutStatusOrRedirect, indexController.getLogInPage);
router.get("/signup", authMiddleware.isLogoutStatusOrRedirect, indexController.getSignUpPage);
router.get("/accountSettings", authMiddleware.isLoginStatusOrRedirect, indexController.getAccountSettingsPage);

module.exports = router;