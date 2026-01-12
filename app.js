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
const passportConfig = require("./passport");

const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');
const worksRouter = require('./routes/worksRouter');
const communityRouter = require('./routes/communityRouter');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "session.db", dir: "./session" }),
    cookie: { maxAge: 3600000 },
  })
);

passportConfig();
app.use(passport.authenticate("session"));

const isApiRequest = (req) => {
  const requestPath = req.originalUrl || "";
  return requestPath.startsWith("/api/") || requestPath === "/api" || requestPath.startsWith("/community");
};

app.use((req, res, next) => {
  res.ok = (data = {}, status = 200) => {
    res.status(status).json({ success: true, ...data });
  };
  res.fail = (message, status = 400, data = {}) => {
    res.status(status).json({ success: false, message, ...data });
  };
  next();
});

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
  if (isApiRequest(req)) {
    res.status(404).json({ success: false, message: "Not found" });
    return;
  }
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  if (isApiRequest(req)) {
    res.status(status).json({ success: false, message: err.message || "Server error" });
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(status);
  res.render('error');
});

module.exports = app;

app.listen(PORT, () => {
  console.log(`Server is running at ${SERVER_URL}`);
});