var express = require('express');
var router = express.Router();
var User = require("../models/user")

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user_id){
    res.render('index', { authenticated: false });
  }
  else {
    res.render('index', { authenticated: true });
  }
});

module.exports = router;

function ensureAuthentication(req, res, next){
  if(req.isAuthenticated())
    return next();
  res.redirect("/users/login");
}
