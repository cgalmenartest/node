/**
 *
 */

var util = require("util");
var events = require("events");
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var lib = require('../utils/lib');

var notificationBuilder = new NotificationBuilder();
// might need to make a facade for complex params
function NotificationBuilder(){
	// events.EventEmitter.call(this);

	/**
	 * public function that performs notification action triggered by a set of parameters stored in 'param' object
	 *
	 * @params - object of the following form
	 * 	params: {
	 *		trigger: {
	 *			callerType: <action-specific>,
	 *			callerId: <action-specific>,
	 *			action : <action-specific>
	 *		}
	 *		data: {
	 *			audience: {
	 *				<action-specific>: {
	 *					fields: { <action-specific> },
	 *					settings: { <action-specific> }
	 *				},
	 *				...
	 *			},
	 *			delivery: {
	 *				<deliveryType>: {
	 *					preflight: {
	 *						fields: { <notification-specific> },
	 *						settings: { <notification-specific> }
	 *					},
	 *					content: {
	 *						fields: { <notification-specific> },
	 *						settings: { <notification-specific> }
	 *					}
	 *				},
	 *				...
	 *			}
	 *		}
	 *		recipients: [ <output> ],
	 *		notifications: [ <output> ],
	 *		deliveries: [ <output> ]
	 * @cb - callback function that accepts error as parameter 1 and the modified params object as parameter 2
	 */

	this.notify = function notify(params, cb){
		// these are unique to this notify call
		var actionID, createdDate, action;
		// preconfiguring param structure
		params.trigger = params.trigger || {};
		params.data = params.data || {};
		params.data.audience = params.data.audience || {};
		params.data.delivery = params.data.delivery || {};
		// return values
		params.recipients = params.recipients || [];
		params.notifications = params.notifications || [];
		params.deliveries = params.deliveries || [];
		// initial state check
		if( !params.trigger.hasOwnProperty("callerType") ||
				!params.trigger.hasOwnProperty('callerId') ||
				!params.trigger.hasOwnProperty('action') ) {
			throw new Error(arguments.callee.name + ' has received an improperly-defined parameter');
		}
		// these are shared among all notifications produced from same notify() call
		actionID = uuid.v4();
		createdDate = new Date();
		prepareAudienceSettingsAndFields();
		// find audience for action, then create notifications for each audience member, then send deliveries for each notification
		async.each(sails.config.notifications.triggers[params.trigger.action].audiences, populateGroup, function(err) {
			async.each(params.recipients, generateUserNotificationsForAction, function(err){
					cb(err, params);
			});
		});

		function prepareAudienceSettingsAndFields(){
			_.each(sails.config.notifications.triggers[params.trigger.action].audiences, prepareSingleAudienceSettingsAndFields);

			function prepareSingleAudienceSettingsAndFields(audience){
				params.data.audience[audience] = params.data.audience[audience] || {};
				params.data.audience[audience].settings = params.data.audience[audience].settings || {};
				params.data.audience[audience].settings = lib.deepExtend(
					sails.config.notifications.audiences[audience].settings,
					params.data.audience[audience].settings
				);
				params.data.audience[audience].fields = params.data.audience[audience].fields || {};
				sails.services.utils.lib['validateFields'](
					params.data.audience[audience].fields,
					sails.config.notifications.audiences[audience].fields
				);
			}

		}


		// creates array of users to whom the notifications apply
		function populateGroup(audience, done){
			var popMethod, actor;
			popMethod = sails.config.notifications.audiences[audience].method;
			actor = sails.services.notifications['audience'];
			actor[popMethod](params.data.audience[audience].fields, params.data.audience[audience].settings, function(err, r) {
			  if (!err) {
			    params.recipients =  _.union(params.recipients, r || []);
			  }
			  done(err);
			});
		}

		// make a notification for the passed user and the notification action
		function generateUserNotificationsForAction(user, done){
			Notification.create({
				callerType: params.trigger.callerType,
				callerId: params.trigger.callerId,
				triggerGuid: actionID,
				action: params.trigger.action,
				recipientId: user.id,
				createdDate: createdDate,
				// data: JSON.stringify(params.data),
				options: JSON.stringify(params.data)
			}).done(function(err, newNotification){
				if (!err) {
			    params.notifications.push(newNotification);
			    deliverNotification(newNotification, function(err){
			    	if(!err){
			    		done(err);
			    	}
			    	else{
			    		done(err);
			    	}
			    });
			  }
			  else{
			  	done(err);
			  }
			});
		}

		function deliverNotification(notification, callback){
			async.each(sails.config.notifications.triggers[params.trigger.action].deliveries, performDelivery, function(err){
				// generate and send deliveries relevant to the given action
				callback(err);
			});

			function performDelivery(deliveryType, done){
				populateSingleDeliveryPreSettingsAndFields(deliveryType);
				performPreDelivery(deliveryType, function(err, content){
					if(!err){
						params.data.delivery[deliveryType].content = lib.deepExtend(params.data.delivery[deliveryType].content, content);
						populateSingleDeliveryContentSettingsAndFields(deliveryType, function(err){
							if(!err){
								generateDelivery(deliveryType, function(err, delivery){
									if (!err) {
										params.deliveries.push(delivery);
										sendDelivery(delivery, function(err, response){
											if (!err) {
												delivery.isDelivered = true;
												delivery.deliveryDate = new Date();
												delivery.save(function(err){
													if (!err) {

													}
													done(err);
												});
											}
											else{
												done(err);
											}
										});
									}
									else{
										done(err);
									}
								});
							}
							else{
								done(err);
							}
						});
					}
					else{
						done(err);
					}
				});
			}

			function populateSingleDeliveryPreSettingsAndFields(deliveryType){
				params.data.delivery[deliveryType] = params.data.delivery[deliveryType] || {};
				params.data.delivery[deliveryType].preflight = params.data.delivery[deliveryType].preflight || {};
				params.data.delivery[deliveryType].preflight.fields = params.data.delivery[deliveryType].preflight.fields || {};
				params.data.delivery[deliveryType].preflight.fields.recipientId = notification.recipientId;
				sails.services.utils.lib['validateFields'](
					params.data.delivery[deliveryType].preflight.fields,
					sails.config.notifications.deliveries[deliveryType].preflight.fields
				);
				params.data.delivery[deliveryType].preflight.settings = params.data.delivery[deliveryType].preflight.settings || {};
				params.data.delivery[deliveryType].preflight.settings = lib.deepExtend(
					sails.config.notifications.deliveries[deliveryType].preflight.settings,
					params.data.delivery[deliveryType].preflight.settings
				);
			}

			function populateSingleDeliveryContentSettingsAndFields(deliveryType, done){
				params.data.delivery[deliveryType] = params.data.delivery[deliveryType] || {};
				params.data.delivery[deliveryType].content = params.data.delivery[deliveryType].content || {};
				params.data.delivery[deliveryType].content.fields = params.data.delivery[deliveryType].content.fields || {};
				sails.services.utils.lib['validateFields'](
					params.data.delivery[deliveryType].content.fields,
					sails.config.notifications.deliveries[deliveryType].content.fields
				);
				params.data.delivery[deliveryType].content.settings = params.data.delivery[deliveryType].content.settings || {};
				UserNotificationSetting.find({
					userId: notification.recipientId,
					actionType: params.trigger.action,
					deliveryType: deliveryType
				}).done(function(err, settings){
					if(!err){
						userSettingObject = {};
						userSettingObject[params.trigger.action] = {};
						_.each(settings, function(userSetting){
							userSettingObject[params.trigger.action][userSetting.key] =  userSetting.value;
						});
						params.data.delivery[deliveryType].content.settings = lib.deepExtend(
							sails.config.notifications.deliveries[deliveryType].content.settings,
							userSettingObject,
							params.data.delivery[deliveryType].content.settings
						);
					}
					done(err);
				});
			}

			function performPreDelivery(deliveryType, done){
				var preDispatcher, actor;
				// call delivery functions
				preDispatcher = sails.config.notifications.deliveries[deliveryType].preflight.method;
				actor = sails.services.notifications['notification'];
				actor[preDispatcher](
					params.data.delivery[deliveryType].preflight.fields,
					params.data.delivery[deliveryType].preflight.settings,
					notification,
					function(err, content) {
				  	done(err, content);
					}
				);
			}

			function generateDelivery(deliveryType, done){
				Delivery.create({
					notificationId: notification.id,
					deliveryType: deliveryType,
					content: JSON.stringify(params.data.delivery[deliveryType].content)
				}).done(done);
			}

			function sendDelivery(delivery, done){
				var dispatcher, actor;
				// call delivery functions
				dispatcher = sails.config.notifications.deliveries[delivery.deliveryType].content.method;
				actor = sails.services.notifications['dispatcher'];
				actor[dispatcher](
					params.data.delivery[delivery.deliveryType].content.fields,
					params.data.delivery[delivery.deliveryType].content.settings,
					function(err, response) {
				  	done(err, response);
					}
				);
			}
		}
	};
}

module.exports = {
	notifier: notificationBuilder
};
