var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

const uri = "mongodb+srv://himanshu:Himanshu103@cluster0-drmqc.mongodb.net/test?retryWrites=true"
mongoose.connect(uri, function(err, client) {
   if(err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
   }
   console.log('Connected...');
   const collection = client.db("test").collection("devices");
   // perform actions on the collection object
   client.close();
});

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

module.exports.getUsersExceptAdmin = function(callback) {
	User.find({
		priority : {
			$ne : 94321
		}
	}).exec(callback);
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

module.exports.convert = function(userId, priority, callback){
	User.update({
		_id : userId
	},
	{
		$set : {
			priority : priority
		}
	}).exec(callback);
}
