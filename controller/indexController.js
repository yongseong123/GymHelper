const createError = require("http-errors");
const usersController = require("../controller/usersController");
const usersModel = require("../model/usersModel");

function getYearAndHalf() {
    let today = new Date();

    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1; // 월 (0부터 시작하므로 1을 더함)
    let half;

    // 1월부터 6월은 1, 7월부터 12월은 2
    if (month >= 1 && month <= 6) {
        half = 1;
    } else {
        half = 2;
    }

    return year + '-' + half; // "년도-반기" 형식의 문자열 반환
}

exports.getLogInPage = async (req, res, next) => {
    res.render('logIn');
};

exports.getSignUpPage = async (req, res, next) => {
    res.render('signUp');
};

exports.getAccountSettingsPage = async (req, res, next) => {
    res.render("accountSettings");
};