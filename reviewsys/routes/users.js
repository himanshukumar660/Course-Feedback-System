var express = require("express");
var crypto = require("crypto");
var url = require("url");
var path = require("path");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");

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
										// res.send({
										// 	responseCode : 0,
										// 	message ; "Invalid Password"
										// });
                    return done(null, false, {message: "Invalid Password"});
                }
            });
        });
    }
));

router.post("/register", ensureNotAuthenticated, function(req, res, next) {
//	console.log(req.body);
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var cnfpassword = req.body.cnfpassword;
  var priority = req.body.pType;

	// Form Validation
	req.checkBody("name", "Name is required").notEmpty();
	req.checkBody("username", "Username is required").notEmpty();
	req.checkBody("password", "Min 5 characters required").isLength({
		min: 5
	});
  req.checkBody("cnfpassword", "Password doesn't match").equals(req.body.password);

	// Check for errors
	var errors = req.validationErrors();
	console.log(errors);

	if (errors) {
		res.send({
      responseCode : 0,
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
		User.createUser(newUser, function(err) {
			if (err) {
				res.send({
          responseCode : 0,
          message : "Username not available",
				});
			}
      else {
				res.send({
          responseCode : 1,
          message : "Account created successfully",
          accountPreview : {
            username : newUser.username,
            type : newUser.priority
        }
      })
			}
		});
	}
});

// router.post("/login", [ensureNotAuthenticated, passport.authenticate("local")], function(req, res) {
// 	res.json({
//     responseCode : 1,
//     message : "User successfully logged in",
//   })
// });

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.send(info); }
		else
		{
			User.getUserByUsername(req.body.username, function(err1, res1){
				if(err1){
					throw err1;
				}
				else {
					console.log(res1);
					req.session.user_id = res1._id;
					return res.json({
				    responseCode : 1,
				    message : "User successfully logged in",
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
	        res.json({
            responseCode : 0,
            message : err
          })
	      } else {
	        res.json({
				      responseCode: 1,
				      message : "Logged out"
					});
	      }
	    });
	  }
  else {
    res.json({
      responseCode:0,
      message : "No active sessions"
    })
	}
});

function ensureNotAuthenticated(req, res, next){
	if(!req.isAuthenticated())
		{
			return next();
		}
	else
	{
			console.log("Authenticated User!");
			res.json({
        responseCode : 0,
        message : "Unauthorized to view this page"
      });
	}
}

module.exports = router;
