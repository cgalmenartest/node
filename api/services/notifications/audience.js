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

	findAllUsers: function(params, cb){
		User.find({}).done(cb);

	},
	findUser: function(params, cb){
		if(!params.hasOwnProperty('data') || !params.data.hasOwnProperty('recipientId'))
		{
			throw new Error(arguments.callee.name + ' has received an improperly-defined parameter');
		}

		User.find({id: params.data.recipientId}).done(cb);
	},
	findProjectOwners: function(params, cb){
		if(!params.hasOwnProperty('data') || !params.data.hasOwnProperty('projectId'))
		{
			throw new Error(arguments.callee.name + ' has received an improperly-defined parameter');
		}
		ProjectOwner.find({projectId: params.data.projectId}).done(convertToUsers);
		//User.find({id: params.data.recipientId}).done(cb);
		function convertToUsers(err, projOwners){
			var uIds = [];
			//var concat = '[';
			_.each(projOwners, function(po){
				uIds.push({ id: po.userId });
			});
			//concat = concat + uIds.join(',') + ']';
			User.find({
				where: {
					or: uIds
				}
			}).done(cb);
		}
	},
	findProjectParticipants: function(params, cb){

	},
	findProjectLikers: function(params, cb){

	},
	findProjectThreadCommenters: function(params, cb){

	}


}