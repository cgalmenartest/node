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

	findAllUsers: function(fields, settings, cb){
		User.find({}).done(cb);
	},
	findUser: function(fields, settings, cb){
		User.find({id: fields.userId}).done(cb);
	},
	findProjectOwners: function(fields, settings, cb){
		ProjectOwner.find({projectId: fields.projectId}).done(convertToUsers);
		function convertToUsers(err, projOwners){
			var uIds = [];
			_.each(projOwners, function(po){
				uIds.push({ id: po.userId });
			});
			User.find({
				where: {
					or: uIds
				}
			}).done(cb);
		}
	},
	findProjectParticipants: function(fields, settings, cb){

	},
	findProjectLikers: function(fields, settings, cb){

	},
	findProjectThreadCommenters: function(fields, settings, cb){

	}


}