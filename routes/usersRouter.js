const express = require('express');
const router = express.Router();
const usersController = require("../controller/usersController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signUp", authMiddleware.isLogoutStatus, usersController.signUp);
router.post("/idCheck", usersController.idCheck);
router.get("/getUserName", authMiddleware.isLoginStatus, usersController.getUserName);
router.post("/logIn", authMiddleware.isLogoutStatus, usersController.logIn);
router.post("/logOut", authMiddleware.isLoginStatus, usersController.logOut);
router.post("/modifyUserInfo", authMiddleware.isLoginStatus, usersController.modifyUserInfo);
router.post("/deleteUser", authMiddleware.isLoginStatus, usersController.deleteUser);

module.exports = router;