const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require("dotenv");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const passport = require("passport");
const passportConfig = require("./passport"); // passport/index.js 폴더 임포트(index.js는 생략가능)

const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');
const subjectsRouter = require('./routes/subjectsRouter');
const friendsRouter = require('./routes/friendsRouter');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
dotenv.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 세션 암호화 키
    resave: false, // 세션 데이터가 수정되지 않으면 저장하지 않음
    saveUninitialized: false, // 초기화되지 않은 세션은 저장하지 않음
    store: new SQLiteStore({ db: "session.db", dir: "./session" }), // SQLite를 세션 저장소로 사용
    cookie: { maxAge: 3600000 }, // 쿠키 유효 시간 설정 (1시간)
  })
);

passportConfig();
app.use(passport.authenticate("session"));

app.use(function (req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/friends', friendsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
