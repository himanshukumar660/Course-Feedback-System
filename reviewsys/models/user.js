var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

mongoose.connect("mongodb://127.0.0.1:27017/reviewsys");

var db = mongoose.connection;

var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: {
		type: String
	},
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
	},
	priority:{
		// 0 -> Normal User
		// 1 -> Owner
		// 2 -> Admin
		type: Number,
		default: 0
	}
});

userSchema.plugin(uniqueValidator);

var User = module.exports = mongoose.model("User", userSchema);

module.exports.createUser = function(newUser, callback) {
    bcrypt.hash(newUser.password, SALT_WORK_FACTOR, function(err, hash) {
      if (err) return err;
      newUser.password = hash;
      newUser.save(callback);
    });
}

module.exports.getUserByUsername = function(username, callback){
	User.findOne({username:username}, callback);
}

module.exports.comparePassword = function(candidatePassowrd, hash, callback){
    bcrypt.compare(candidatePassowrd, hash, function(err, isMatch){
        if(err) return callback(err);
        callback(null, isMatch);
    });
}

module.exports.getUsers = function(callback) {
	User.find({}).exec(callback);
};

module.exports.getUserById = function(id, callback) {
	User.findOne({_id : id}).exec(callback);
};

module.exports.deleteUserById = function(user_id, callback){
	User.remove({_id : user_id}).exec(callback);
}

module.exports.isPresent = function(userId, callback){
	User.count({
		_id : userId
	}, callback);
}
