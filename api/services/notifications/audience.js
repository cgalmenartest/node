/**
 * Source definition for
 *
 * @module    :: Source
 * @description ::
 */
 var util = require("util");
 var events = require("events");
 var _ = require('underscore');
 var async = require('async');


 function convertToUsers(err, userIdPropertyCollection, cb){
 	var uIds = [];
 	_.each(userIdPropertyCollection, function(item){
 		uIds.push({ id: item.userId });
 	});
 	User.find({
 		where: {
 			or: uIds
 		}
 	}).done(cb);
 }


module.exports = {

	findAllUsers: function(fields, settings, cb){
		User.find({}).done(cb);
	},
	findUser: function(fields, settings, cb){
		User.find({id: fields.userId}).done(cb);
	},
	findProjectOwners: function(fields, settings, cb){
		ProjectOwner.find({projectId: fields.projectId}).done(function(err, owners){
			convertToUsers(err, owners, cb);
		});
	},
	findProjectParticipants: function(fields, settings, cb){
		// todo
	},
	findProjectLikers: function(fields, settings, cb){
		// todo
	},
	findProjectThreadCommenters: function(fields, settings, cb){
		// todo
	},
	findProjectThreadParentCommenters: function(fields, settings, cb){
		Comment.find({id : fields.id }).done(function(err, comments){
			if(!err && comments.length > 0){
				var comment = comments.pop();
				sails.services.utils['comment'].commentParentThreadAssemble(comment, {}, function (err, comments){
				  if(!err){
				  	convertToUsers(err, comments, cb);
				  }
				  cb(err, comments);
				});
			}
			else {
				cb(err, []);
			}
		});
	}


}