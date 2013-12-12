/**
 *
 */

var util = require("util");
var events = require("events");
var _ = require('underscore');
var async = require('async');

var self = this;


// function serviceLookup(src, actor, operation, done){

// 	operation(src, actor, function(err, r){
// 		done(err,r);
// 	});

// }



function ActionTriggerBuilder(){
	events.EventEmitter.call(this);
	this.processTrigger = processTrigger;

}

function NotificationBuilder(params){
	events.EventEmitter.call(this);
}
function DeliveryBuilder(params){
	events.EventEmitter.call(this);
}

function processTrigger(params, cb){
	/* caller, callerId, callerType, actionDate, triggerMeta, data, options*/

	function populateGroup(groupName, done){

		var group = sails.config.notifications.userGroups[groupName];
		var popMethod = group.populateFunction;

		var actor = sails.services.notifications['audience'];

		actor[popMethod](params, function(err, r) {
		  if (!err) {
		  	// console.log(r);
		    results =  _.union(results, r || []);
		  }
		  done(err);
		});
	}

	function generateNotificationsForUserGroup(userIds, params, done){

	}

	var results = results || [];

	if( !params.hasOwnProperty("callerType") ||
			!(params.hasOwnProperty('caller') || params.hasOwnProperty('callerId')) ||
			!params.hasOwnProperty('triggerMeta') ||
			!params.triggerMeta.hasOwnProperty('action') ) {
		throw new Error(arguments.callee.name + ' has received an improperly-defined parameter');
	}
	if( params.hasOwnProperty('caller') && !params.hasOwnProperty('callerId'))
	{
		params.callerId = caller.id;
	}

	async.each(sails.config.notifications.audience[params.triggerMeta.action], populateGroup, function(err) {
	  cb(err, results);
	});

}

util.inherits(ActionTriggerBuilder, events.EventEmitter);
util.inherits(NotificationBuilder, events.EventEmitter);
util.inherits(DeliveryBuilder, events.EventEmitter);

// ActionTriggerBuilder.prototype.__proto__ = events.EventEmitter.prototype;
// NotificationBuilder.prototype.__proto__ = events.EventEmitter.prototype;
// DeliveryBuilder.prototype.__proto__ = events.EventEmitter.prototype;

var actionTriggerBuilder = new ActionTriggerBuilder();
var notificationBuilder = new NotificationBuilder();
var deliveryBuilder = new DeliveryBuilder();



var processNotification = function(params){
	/* triggerId, recipientId, createdDate, data, options, isLinkedToTrigger, isProcessed, isActive */
	var actor = sails.services.sources[params.triggerMeta.action];
	actor.process();
};
var processDelivery = function(params){
	/* notificationId, recipientId, isDelivered, scheduledDeliveryDate, deliveryDate, dispatchType, data, options, isActive*/
	var actor = sails.services.sources[params.triggerMeta.action];
	actor.process();
};

actionTriggerBuilder.on('Init', processTrigger);
notificationBuilder.on('Init', processNotification);
deliveryBuilder.on('Init', processDelivery);

module.exports = {
	actionTriggerBuilder: actionTriggerBuilder//,
	// notificationBuilder: notificationBuilder,
	// deliveryBuilder: deliveryBuilder
};