var express = require("express");
var crypto = require("crypto");
var url = require("url");
var path = require("path");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");
var xss = require("xss");

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
    function(username, password, done){
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
            	 	return done(null, false, {message: "Unknown User"});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: "Invalid Password"});
                }
            });
        });
    }
));

function ensureAuthentication(req, res, next){
	if(!req.isAuthenticated())
		{
			return next();
		}
	else
	{
			res.status(401).send({
        message : "All active sessions must be logged out"
      });
	}
}

router.post("/register", ensureAuthentication, function(req, res, next) {
	// Form Validation
	req.checkBody("name", "Name is required").notEmpty();
	req.checkBody("username", "Username should be alphanumeric").isAlphanumeric();
	req.checkBody("username", "Username is required").notEmpty();
	req.checkBody("password", "Min 5 characters required").isLength({
		min: 5
	});
  req.checkBody("cnfpassword", "Password doesn't match").equals(req.body.password);

	if(Number(req.body.pType)!=94321){
		req.checkBody("pType", "Priority should be number between 1 and 2").isInt({min :1, max:2}, { allow_leading_zeroes: false });
	}

	// Check for errors
	var errors = req.validationErrors();

	var name = xss(req.body.name);
	var username = xss(req.body.username);
	var password = xss(req.body.password);
	var cnfpassword = xss(req.body.cnfpassword);
  var priority = xss(req.body.pType);

	if (errors) {
		res.status(400).send({
      message : "Input Validation Error",
			errors: errors
		});
	}
  else {
		var newUser = new User({
			name: name,
			username: username,
			password: password,
			priority : priority,
		});
		// Create User
		User.createUser(newUser, function(err_user, res_user) {
			if (err_user) {
				res.status(401).send({
          message : "Username not available"
				});
			}
      else {
				res.status(200).send({
          message : "Account created successfully",
      })
			}
		});
	}
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { console.log(info); return res.status(401).send(info); }
		else
		{
			User.getUserByUsername(req.body.username, function(err_user, res_user){
				if(err_user){
					res.status(401).send({
						message : "No user with specified details available"
					})
				}
				else {
					req.session.user_id = res_user._id;
					console.log(res_user);
					return res.status(200).send({
				    message : "User successfully logged in",
						details : res_user
				  })
				}
			})
		}
  })(req, res, next);
});

router.get("/logout", function(req, res) {
	if(req.session.user_id) {
	    req.session.destroy(function(err) {
	      if(err) {
	        res.send({
            message : err
          })
	      } else {
	        res.status(200).send({
				      message : "Logged out"
					});
	      }
	    });
	  }
  else {
    res.status(401).send({
      message : "No active sessions"
    })
	}
});

module.exports = router;
