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
		// find audience for action, then create notifications for each audience member, then send deliveries for each notification
		async.each(sails.config.notifications.triggers[params.trigger.action].audiences, establishAudience, function(err){
				async.each(params.recipients, generateUserNotificationsForAction, function(err){
						cb(err, params);
				});
		});
		/**
		 * private function that configures audience settings from main param, then populates and validates fields from main param, then populates recipient pool with union to prevent duplicates
		 * @audience - name of audience
		 */
		function establishAudience(audience, done){
			params.data.audience[audience] = params.data.audience[audience] || {};
			sythesizeSettings(params.data.audience[audience], sails.config.notifications.audiences[audience], function(err){
				if(err){ console.log(err); done(null); return false;}
				synthesizeAndValidateFields(params.data.audience[audience], sails.config.notifications.audiences[audience], sails.services.utils.lib['validateFields'], function(err){
					if(err){ console.log(err); done(null); return false;}
					performServiceAction(sails.services.notifications['audience'], sails.config.notifications.audiences[audience].method, params.data.audience[audience], function(err, r){
						if(err){ console.log(err); done(null); return false;}
					  params.recipients =  _.union(params.recipients, r || []);
						done(null);
					});
				});
			});
		}
		/**
		 * private function that makes a notification for the passed user and the notification action, then triggers the send delivery function for that notification
		 * @user - user object
		 */
		function generateUserNotificationsForAction(user, done){
			Notification.create({
				callerType: params.trigger.callerType,
				callerId: params.trigger.callerId,
				triggerGuid: actionID,
				action: params.trigger.action,
				recipientId: user.id,
				createdDate: createdDate,
				options: JSON.stringify(params.data)
			}).done(function(err, newNotification){
				if(err){ console.log(err); done(null); return false;}
		    params.notifications.push(newNotification);
		    deliverNotification(newNotification, function(err){
		    	if(err){ console.log(err); done(null); return false;}
	    		done(null);
		    });
			});
		}
		/**
		 * private function that iterates through each delivery for the given notification and processes it
		 * @notification - notification object
		 */
		function deliverNotification(notification, callback){
			async.each(sails.config.notifications.triggers[params.trigger.action].deliveries, deliver, function(err){
				callback(err);
			});
			/**
			 * private function that consumes main param fields/settings and performs all pre-flight notification preparation for delivery, then consumes main param fields/settings to generate a delivery and send it
			 * @deliveryType - string name of delivery type
			 */
			function deliver(deliveryType, done){
				params.data.delivery[deliveryType] = params.data.delivery[deliveryType] || {};
				preparePreflight(deliveryType, notification, function(err, content){
					if(err){ console.log(err); done(null); return false;}
					prepareDelivery(deliveryType, content, notification, function(err, delivery){
						if(err){ console.log(err); done(null); return false;}
						registerDeliveryAsSent(delivery, done);
						// done(null);
					});
				});
			}
			/**
			 * private function that consumes main param fields/settings and performs all pre-flight notification preparation for delivery
			 * @deliveryType - string name of delivery type
			 * @notification - notification object
			 */
			function preparePreflight(deliveryType, notification, done){
				params.data.delivery[deliveryType].preflight = params.data.delivery[deliveryType].preflight || {};
				params.data.delivery[deliveryType].preflight.fields = params.data.delivery[deliveryType].preflight.fields || {};
				params.data.delivery[deliveryType].preflight.fields.recipientId = notification.recipientId;
				params.data.delivery[deliveryType].preflight.fields.callerId = notification.callerId;
				sythesizeSettings(params.data.delivery[deliveryType].preflight, sails.config.notifications.deliveries[deliveryType].preflight, function(err){
					if(err){ console.log(err); done(null, params.data.delivery[deliveryType].content); return false;}
					synthesizeAndValidateFields(params.data.delivery[deliveryType].preflight, sails.config.notifications.deliveries[deliveryType].preflight, sails.services.utils.lib['validateFields'], function(err){
						if(err){ console.log(err); done(null, params.data.delivery[deliveryType].content); return false;}
						performServiceAction(sails.services.notifications['notification'], sails.config.notifications.deliveries[deliveryType].preflight.method, params.data.delivery[deliveryType].preflight, function(err, content){
							if(err){ console.log(err); done(null, params.data.delivery[deliveryType].content); return false;}
							params.data.delivery[deliveryType].content = lib.deepExtend(params.data.delivery[deliveryType].content, content);
							done(err, params.data.delivery[deliveryType].content);
						});
					});
				});
			}
			/**
			 * private function that consumes main param fields/settings and generates a delivery and sends it
			 * @deliveryType - string name of delivery type
			 * @content - content to be added to delivery data
			 * @notification - notification object
			 */
			function prepareDelivery(deliveryType, content, notification, done){
				params.data.delivery[deliveryType].content = params.data.delivery[deliveryType].content || {};
				sythesizeSettings(params.data.delivery[deliveryType].content, sails.config.notifications.deliveries[deliveryType].content, {userId: notification.recipientId,actionType: params.trigger.action,deliveryType: deliveryType}, function(err){
					if(err){ console.log(err); done(null, null); return false;}
						synthesizeAndValidateFields(params.data.delivery[deliveryType].content, sails.config.notifications.deliveries[deliveryType].content, sails.services.utils.lib['validateFields'], function(err){
							if(err){ console.log(err); done(null, null); return false;}
								generateDelivery(deliveryType, notification, function(err, delivery){
									if(err){ console.log(err); done(null, null); return false;}
									params.deliveries.push(delivery);
									done(err, delivery);
								});
						});
				});
			}
			/**
			 * private function that updates a delivery as sent
			 * @delivery - string name of delivery type
			 */
			function registerDeliveryAsSent(delivery, done){
				performServiceAction(sails.services.notifications['dispatcher'], sails.config.notifications.deliveries[delivery.deliveryType].content.method, params.data.delivery[delivery.deliveryType].content, function(err, response){
					if(err){ console.log(err); done(null); return false; }
						delivery.isDelivered = true;
						delivery.deliveryDate = new Date();
						delivery.save(function(err){
							if(err){ console.log(err); done(null); return false;}
							done(null);
						});
				});
			}
			/**
			 * private function creates the delivery model
			 * @deliveryType - string name of delivery type
			 */
			function generateDelivery(deliveryType, notification, done){
				Delivery.create({
					notificationId: notification.id,
					deliveryType: deliveryType,
					content: JSON.stringify(params.data.delivery[deliveryType].content)
				}).done(done);
			}
		}
		/**
		 * private helper function that properly sets all settings
		 * @hostObject - object that contains a settings property
		 * @globalObject - global object that contains a settings property
		 * @userSettingTemplate - optional property that contains a match for user settings
		 */
		function sythesizeSettings(hostObject, globalObject, userSettingTemplate, done){
			hostObject.settings = hostObject.settings || {};
			if(typeof userSettingTemplate === 'function'){
				done = userSettingTemplate;
				hostObject.settings = lib.deepExtend(
					globalObject.settings,
					hostObject.settings
				);
				done(null);
			}
			else{
				UserSetting.find({
					userId: userSettingTemplate.userId,
					actionType: userSettingTemplate.actionType,
					deliveryType: userSettingTemplate.deliveryType
				}).done(function(err, settings){
					if(err){ console.log(err); done(null); return false;}
					userSettingObject = {};
					userSettingObject[userSettingTemplate.actionType] = {};
					_.each(settings, function(userSetting){
						userSettingObject[userSettingTemplate.actionType][userSetting.key] =  userSetting.value;
					});
					// setting priority is local > user > global
					hostObject.settings = lib.deepExtend(
						globalObject.settings,
						userSettingObject,
						hostObject.settings
					);
					done(err);
				});
			}
		}
		/**
		 * private helper function that properly sets all fields and validates them based on service method
		 * @hostObject - object that contains a fields property
		 * @globalObject - global object that contains a fields property
		 * @validator - validation function to apply
		 */
		function synthesizeAndValidateFields(hostObject, globalObject, validator, done){
			hostObject.fields = hostObject.fields || {};
			validator(hostObject.fields, globalObject.fields, done);
		}
		/**
		 * private helper function that fires off a service method
		 * @actor - object upon which the service is called
		 * @action - service method to call
		 * @actionParams - object with fields and settings to be applied in the method
		 */
		function performServiceAction(actor, action, actionParams, done){
			actor[action](
				actionParams.fields,
				actionParams.settings,
				done
			);
		}
	};
}

module.exports = {
	notifier: notificationBuilder
};
