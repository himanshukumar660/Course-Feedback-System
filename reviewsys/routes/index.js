var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Org = require('../models/org');
var xss = require('xss');

function ensureAuthentication(req, res, next){
  if(req.session.user_id && req.cookies['connect.sid'])
    return next();
  else {
    res.status(401).send({
      message : "Unauthorized to perform this action"
    })
  }
};

function checkOwnerPriority(req, res, next){
  User.getUserById(req.session.user_id, function(err_user, res_user){
    if(err_user){
      return res.status(400).send({
        message : err_user
      });
    }
    if(res_user.priority==2){
      return next(res_user.username, req, res, next);
    }
    else {
      return res.status(401).send({
        message : "Unauthorized to perform this action"
      });
    }
  });
};

function checkOwnerAdminPriority(req, res, next){
  User.getUserById(req.session.user_id, function(err_user, res_user){
    if(err_user){
      return res.status(400).send({
        message : err_user
      });
    }
    else{
      if(res_user.priority!=1){//Not an user
        if(res_user.priority==2){ //is owner
          //check if the outlet belongs to him
          var outletId = req.params.outletId;
          var userName = res_user.username;
          Org.isOwner(outletId, userName, function(org_err, org_res){
            if(org_err){
              res.status(400).send({
                message : org_err
              });
            }
            else{
              if(org_res==0){
                res.status(401).send({
                  message : "Unauthorized to perform this action"
                })
              }
              else {
                return next();
              }
            }
          });
        }
        else if(res_user.priority==94321){ //is admin
          return next();
        }
        else{
          return res.status(400).send({
            message : "Unknown User"
          });
        }
      }
      else {
        return res.status(401).send({
          message : "Unauthorized to perform this action"
        });
      }
    }
  });
};

function checkAdminPriority(req, res, next){
  User.getUserById(req.session.user_id, function(err_user, res_user){
    if(err_user){
      return res.status(400).send({
        message : err_user
      });
    }
    else{
      if(res_user.priority==94321){
          return next();
      }
      else{
        return res.status(401).send({
          message : "Admin can't perform modifications to his own account"
        });
      }
    }
  });
};

function checkNotAdminUserId(req, res, next){
  if(req.session.user_id == req.params.userId){
    return res.send(401).send({
      message : "Admin can't perform actions on his own account"
    });
  }
  else{
    return next();
  }
};

function checkUserExistenceById(req, res, next){
  User.isPresent(req.params.userId, function(user_err, user_res){
    if(user_err){
      throw user_err;
    }
    else{
      if(user_res!=0){
        return next();
      }
      else{
        res.status(400).send({
          message : "User does'nt exist"
        })
      }
    }
  });
}

function getUsernameById(req, res, next){
  User.getUserById(req.params.userId, function(err_user, res_user){
    if(err_user){
      res.status(400).send({
        message : err_user
      });
    }
    else{
      return next(res_user.username, req, res, next);
    }
  })
}

function getUseranme(req, res, next){
  User.getUserById(req.session.user_id, function(err_user, res_user){
    if(err_user){
      res.status(400).send({
        message : err_user
      });
    }
    else{
      return next(res_user.username, req, res, next);
    }
  })
}

function checkOrgExistence(req, res, next){
  Org.isPresentById(req.params.outletId, function(err_org, res_org){
    if(err_org){
      return res.status(400).send({
        message : "Error in deleting retaurant",
        error : err_org
      })
    }
    else {
      if(res_org==0){
        res.status(404).send({
          message : "Restaurant does'nt exist in the database"
        });
      }
      else{
        return next();
      }
    }
  })
};

function deleteOrgById(username, req, res, next){
  Org.deleteOrgByOwnerId(username, function(user_err, user_res){
    if(user_err){
      throw user_err;
      return next(username, req, res, next);
    }
    else{
      return next(username, req, res, next);
    }
  });
  return next;
}

function checkNotOwner(req, res, next){
  User.getUserById(req.session.user_id, function(err_user, res_user){
    if(err_user){
      res.status(400).send({
        message : err_user
      });
    }
    else{
      if(res_user.priority==1){
        return next(res_user.username, req, res, next);
      }
      else{
        res.status(400).send({
          message : "Only users are allowed to give reivews"
        })
      }
    }
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user_id){
    res.render('index', { authenticated: false });
  }
  else {
    res.render('index', { authenticated: true });
  }
});

router.post('/outlet', [ensureAuthentication, checkOwnerPriority], function(username, req, res, next){
    var sName, sDesc, sAddr, sOwner;

    sName = xss(req.body.name);
    sDesc = xss(req.body.desc);
    sAddr = xss(req.body.address);
    sOwner = username;

  // Form Validaiton
    req.checkBody("name").notEmpty();

    // Check for errors
    var errors = req.validationErrors();

    if (errors) {
      return res.status(400).send({
        message : "Insufficient inputs",
        errors: errors
      });
    }

    var param = new Org({
      metadata : {
        name : sName,
        owner : username
      },
        desc : sDesc,
        addr : sAddr
    });

    //console.log(param);
    Org.makeOrg(param, function(err_org, res_org){
      if(err_org){
        return res.status(409).send({
          message : "Restaurants already exists"
        })
      }
      else {
        return res.status(200).send({
          message : "Restaurant added to database successfully"
        });
      }
    });
});

router.get('/outlet', ensureAuthentication, function(req, res, next){
    Org.listOrg(function(org_err, org_res){
      if(org_err){
        res.status(400).send({
          message : org_err
        })
      }
      else{
        res.status(200).send({
          list : org_res
        });
      }
    });
});

router.get('/outlet/:userId', [ensureAuthentication, getUsernameById], function(username, req , res, next){
    Org.getOrgByUserName(username, function(org_err, org_res){
        if(org_err){
          res.status(400).send({
            message : org_err
          })
        }
        else {
          res.status(200).send({
            list : org_res
          });
        }
    });
});

router.put('/outlet/review/:outletId', [ensureAuthentication, checkNotOwner], function(username, req, res, next){
  var outletId = req.params.outletId;


  req.checkBody("rating").notEmpty();
  req.checkBody("rating").isInt();
  req.checkBody("comment").notEmpty();

  // Check for errors
  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      message : "Input validation error",
      errors: errors
    });
  }

  var sComment = xss(req.body.comment);
  var sRating = Number(xss(req.body.rating));

  var reviewObj = {
    customerId : username,
    rating : sRating,
    comment : sComment
  };

  Org.addReviewByOrgId(outletId, reviewObj, function(err_org, res_org){
    if(err_org){
      res.status(400).send({
        message : err_org
      });
    }
    else{
      res.status(200).send({
        message : "Reply added successfully"
      });
    }
  });
});

router.put('/outlet/reply/:outletId/:reviewId', [ensureAuthentication, checkOwnerPriority], function(username, req, res, next){

    var reviewId = xss(req.params.reviewId);
    var outletId = xss(req.params.outletId);

    Org.replyReviewById(reviewId, outletId, function(err_org, res_org){
      if(err_org){
        return res.status(400).send({
          message : err_org
        });
      }
      else{
        res.status(200).send({
          message : "Successfully replied to review"
        });
      }
    });
})

router.delete('/outlet/:outletId', [ensureAuthentication, checkOwnerAdminPriority, checkOrgExistence], function(req, res, next){
    Org.deleteOrgById(req.params.outletId, function(org_err, org_res){
      if(org_err){
        res.status(400).send({
          message : org_err
        })
      }
      else{
        res.status(200).send({
          message : "Restaurant deleted successfully"
        });
      }
    });
});

router.delete('/outlet/review/:outletId/:reviewId', [ensureAuthentication, checkAdminPriority], function(req, res, next){

    var outletId = xss(req.params.outletId);
    var reviewId = xss(req.params.reviewId);

    Org.deleteReviewById(outletId, reviewId, function(review_err, review_res){
      if(review_err){
        res.status(400).send({
          message : review_err
        })
      }
      else{
        res.status(200).send({
          message : "Review deleted successfully"
        });
      }
    });
});

router.get('/users/', [ensureAuthentication, checkAdminPriority], function(req, res, next){
  User.getUsers(function(user_err, user_res){
    if(user_err)
    {
      res.status(400).send({
        message : user_err
      })
    }
    else{
      res.status(200).send({
        list : user_res
      })
    }
  });
});

router.delete('/users/:userId', [ensureAuthentication, checkAdminPriority, checkNotAdminUserId, checkUserExistenceById, getUsernameById, deleteOrgById], function(username, req, res, next){

  User.deleteUserById(req.params.userId, function(user_err, user_res){
    if(user_err)
    {
      res.status(400).send({
        message : user_err
      })
    }
    else{

      res.status(200).send({
        message : "User deleted successfully"
      })
    }
  });
});

module.exports = router;
