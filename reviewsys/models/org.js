var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var ObjectID = require("mongodb").ObjectID;
var Review =

mongoose.connect("mongodb://127.0.0.1:27017/reviewsys");

var db = mongoose.connection;

var Schema = mongoose.Schema;

var reviewSchema = new Schema({
		customerId : {
			type : String
		},
		rating: {
			type : Number
		},
		comment:{
			type : String
		},
		reply:{
			type : String
		},
		date : {
			type : Date,
			default : Date.now()
		}
});

var orgSchema = new Schema({
	metadata : {
			type:{
				owner: {
					type: String,
					required : true
				},
				name: {
					type: String,
					required: true,
				}
			},
			unique : true
	},
	desc: {
		type: String
	},
	addr: {
		type: String
	},
	reviews :[reviewSchema]
});

orgSchema.plugin(uniqueValidator);

orgSchema.index({"$**" : "text"},{default_language : "none"});

var Org = module.exports = mongoose.model("Org", orgSchema);
var Review = mongoose.model("Review", reviewSchema);

module.exports.makeOrg = function(orgDetails, callback){
		orgDetails.save(callback);
}

module.exports.listOrg = function(callback) {
	Org.find({}).exec(callback);
}

module.exports.deleteOrgById = function(id, callback) {
	Org.remove({_id : id}).exec(callback);
}

module.exports.deleteOrgByOwnerId = function(owner, callback){
	Org.remove({
		"metadata.owner" : owner
	}, callback);
}

module.exports.getOrgByUserName = function(username, callback){
	Org.find({"metadata.owner" : username}).exec(callback);
};

module.exports.isOwner = function(id, username, callback){
	Org.count({_id : id, "metadata.owner" : username}, callback);
}

module.exports.deleteReviewById = function(orgId, reviewId, callback){
	Org.update(
		{
			_id : orgId
		}, {
			$pull : {
			reviews : {
				_id : reviewId
			}
		}}).exec(callback);
}

module.exports.isPresentById = function(id, callback){
	var isPresent = Org.count({_id : id}, callback);
}

module.exports.addReviewByOrgId = function(orgId, reviewObj, callback){
	// var reviewObj = new Review({
	// 	customer : reviewObj.customer,
	// 	rating : reviewObj.rating,
	// 	comment : reviewObj.comment
	// });
	var myObj = new Review({
		customerId : reviewObj.customerId,
		rating : reviewObj.rating,
		comment : reviewObj.comment
	});

	Org.update(
	    { _id: orgId },
	    { $push: { reviews : myObj } },
	    callback
	);
}

module.exports.replyReviewById = function(reviewId, orgId, callback){
	Org.update({
		$and : [{_id : orgId}, {"reviews._id" : reviewId}]
	}, {
		$set : {
			"reviews.$.reply" : "Hello This is my comment"
		}
	}).exec(callback);
};

module.exports.getReviewsById = function(outletId, callback){
	outletId = new ObjectID(outletId);
	Org.aggregate(
		[
		{
			$match : {
				_id : outletId
			}
		},
		{
			$unwind : '$reviews'
		},
		{
			$sort : {'reviews.date' : -1}
		},
		{
			$group : {
				_id : outletId,
				reviews : {
					$push : '$reviews'
				}
		}
	}]).exec(callback);
}

module.exports.getToReplyReviews = function(outletId, username, callback){
	Org.findOne({
		_id : outletId,
		"metadata.owner" : username
	}, {reviews : 1, _id : 0}, callback);
}
