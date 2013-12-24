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



module.exports = {

	passThrough: function(fields, settings, cb){
		cb(null, {});
	},
	prepareCommentReplyEmail: function(fields, settings, cb){
		var content = {};
		content.fields = {};
		content.settings = {};
		UserEmail.find({ userId : fields.recipientId }).done(function(err, userEmails){

			if(!err){
				var userEmail = userEmails.pop();
				if(userEmail) content.fields.to = userEmail.email;

				Comment.find({ id: fields.callerId }).done(function(err, comments){
					if(!err){
						var callComment = comments.pop();
						if(callComment){
								Comment.find({ id: callComment.parentId }).done(function(err, comments){
									if(!err){
										var parComment = comments.pop();
										if(parComment){
											User.find({id: callComment.userId}).done(function(err, users){
												if(!err){
													var user = users.pop();
													if(user){
														content.fields.subject = user.name + " has replied to your comment";
														content.fields.templateLocals = {};
														content.fields.templateLocals.parentComment = parComment.value;
														content.fields.templateLocals.callerComment = callComment.value;
													}
													cb(err, content);
												}
												else{
													cb(err, content);
												}
											});
										}
										else{
											cb(err, content);
										}
									}
									else{
										cb(err, content);
									}
								});
						}
						else{
							cb(err, content);
						}
					}
					else{
						cb(err, content);
					}
				});

			}
			else{
				cb(err, content);
			}
		});

	}

}