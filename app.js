const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require("dotenv");

dotenv.config();
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const passport = require("passport");
const passportConfig = require("./passport"); // passport/index.js ?´ë” ?„í¬??index.js???ëžµê°€??

const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');
const worksRouter = require('./routes/worksRouter');
const communityRouter = require('./routes/communityRouter');


const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`; // SERVER_URL ê°€?¸ì˜¤ê¸?

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET, // ?¸ì…˜ ?”í˜¸????
    resave: false, // ?¸ì…˜ ?°ì´?°ê? ?˜ì •?˜ì? ?Šìœ¼ë©??€?¥í•˜ì§€ ?ŠìŒ
    saveUninitialized: false, // ì´ˆê¸°?”ë˜ì§€ ?Šì? ?¸ì…˜?€ ?€?¥í•˜ì§€ ?ŠìŒ
    store: new SQLiteStore({ db: "session.db", dir: "./session" }), // SQLiteë¥??¸ì…˜ ?€?¥ì†Œë¡??¬ìš©
    cookie: { maxAge: 3600000 }, // ì¿ í‚¤ ? íš¨ ?œê°„ ?¤ì • (1?œê°„)
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
app.use('/api/works', worksRouter);
app.use('/community', communityRouter);
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

app.listen(PORT, () => {
  console.log(`Server is running at ${SERVER_URL}`);
});