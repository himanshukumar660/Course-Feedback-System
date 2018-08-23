var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var expressValidator = require("express-validator");
var cookieParser = require("cookie-parser");
var crypto = require("crypto");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var randomstring = require("randomstring");

var db = mongoose.connection;

var routes = require("./routes/index");
var users = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret:"secret",
    saveUninitialized: false,
    resave: false,
    cookie: {
        expires: 60000*60*24*7
    }
}));

// passport
app.use(passport.initialize());
app.use(passport.session());
// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split(".")
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += "[" + namespace.shift() + "]";
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use(function(req, res, next) {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
  next();
});

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.get("*", function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

app.use("/", routes);
app.use("/user/", users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      responseCode : 0,
      message : err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

module.exports = app;
