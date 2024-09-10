const express = require('express');
const router = express.Router();
const worksController = require("../controller/worksController");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = router;