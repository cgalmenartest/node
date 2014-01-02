/**
 *	This handles all automated notification services for the midas application
 */

var util = require("util");
var events = require("events");
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var lib = require('../utils/lib');

var notificationBuilder = new NotificationBuilder();

function NotificationBuilder(){
	// events.EventEmitter.call(this);

	/**
	 * public function that performs notification action triggered by a set of parameters stored in 'param' object
	 * @params - object of the following form (analogous to triggerRoutes config item in notifications.js)
	 *
	 * 	params: {
	 *		trigger: {
	 *			callerType: <action-specific>,
	 *			callerId: <action-specific>,
	 *			action : <action-specific>
	 *		}
	 *		data: {
	 *			audience: {
	 *				<audienceName>: {
	 *					fields: { <audience-specific> },
	 *					settings: { <audience-specific> },
	 *     			strategy: {
	 *     				<strategyName>: {
	 *     					preflight: {
	 *     						<preflightName>: {
	 *     							fields: { <preflight-specific> },
	 *     							settings: { <preflight-specific> }
	 *     						},
	 *     						...
	 *     					},
	 *     					delivery: {
	 *     						<deliveryType>: {
	 *     							fields: { <deliveryType-specific> },
	 *     							settings: { <deliveryType-specific> }
	 *     						}
	 *     					}
	 *     				},
	 *     				...
	 *     			}
	 *				},
	 *				...
	 *			}
	 *		}
	 *
	 *
	 *		recipients: [ <output> ],
	 *		notifications: [ <output> ],
	 *		deliveries: [ <output> ]
	 * @cb - callback function that accepts error as parameter 1 and the modified params object as parameter 2
	 * @isCBShortCircuited - is completion of notification not critical to continuation of execution?
	 */
	this.notify = function notify(params, isCBShortCircuited, cb){
		if(typeof isCBShortCircuited === 'function'){
			cb = isCBShortCircuited;
			isCBShortCircuited = false;
		}
		if(isCBShortCircuited){
			cb(null);
		}
		// these are unique to this notify call
		var actionID, createdDate, action;
		// preconfiguring param structure
		params.trigger = params.trigger || {};
		params.data = params.data || {};
		params.data.audience = params.data.audience || {};
		// initial state check
		if( !params.trigger.hasOwnProperty("callerType") ||
				!params.trigger.hasOwnProperty('callerId') ||
				!params.trigger.hasOwnProperty('action') ) {
			throw new Error(arguments.callee.name + ' has received an improperly-defined parameter');
		}
		// these are shared among all notifications produced from same notify() call
		actionID = uuid.v4();
		createdDate = new Date();
		// find audience for action, then create notifications for each audience member, then send deliveries for each notification.
		// Structure is far from ideal, but it must be done this way to get around the cumbersome single parameter restriction in the async library's "each" function
		async.each(Object.keys(sails.config.notifications.triggerRoutes[params.trigger.action].audience), startNotify, function(err){
			if(!isCBShortCircuited){
				cb(null);
			}
		});

		function startNotify(audience, done){
			populateRecipients(audience, function(err, recipients, audience){
				generateNotificationForAction(audience, recipients, function(err, notification, audience, recipients){

					function finishNotify(recipient, fin){
						generateUserNotifications(audience, notification, recipient, function(err, userNotification, recipient, notification, audience){
							deliverNotification(notification, recipient, userNotification, fin);
						});
					}

					async.each(recipients, finishNotify, done);
				});
			});
		}
		/**
		 * private function that configures audience settings from main param, then populates and validates fields from main param, then returns recipient pool
		 * @audience - name of audience
		 */
		function populateRecipients(audience, done){
			params.data.audience[audience] = params.data.audience[audience] || {};
			sythesizeSettings(
				params.data.audience[audience],
				sails.config.notifications.audiences[audience],
				function(err, settings){
					if(err){ console.log(err); done(null, [], audience); return false;}
					synthesizeAndValidateFields(
						params.data.audience[audience],
						sails.config.notifications.audiences[audience],
						sails.services.utils.lib['validateFields'],
						function(err, fields){
							if(err){ console.log(err); done(null, [], audience); return false;}
							performServiceAction(
								sails.services.notifications['audience'],
								sails.config.notifications.audiences[audience].method,
								{ settings: settings, fields: fields },
								function(err, recipients){
									if(err){ console.log(err); done(null, recipients, audience); return false;}
									done(null, recipients, audience);
								}
							);
						}
					);
				}
			);
		}
		/**
		 * private function that makes a notification for the notification action
		 * @audience - name of audience
		 * @recipients - array of users that comprise the audience to which the notification applies
		 */
		function generateNotificationForAction(audience, recipients, done){
			Notification.create({
				callerType: params.trigger.callerType,
				callerId: params.trigger.callerId,
				triggerGuid: actionID,
				action: params.trigger.action,
				audience: audience,
				createdDate: createdDate,
				options: JSON.stringify(params.data)
			}).done(function(err, newNotification){
				if(err){ console.log(err); done(null, newNotification, audience, recipients); return false;}
    		done(null, newNotification, audience, recipients);
			});
		}

		/**
		 * private function that ties a notification to the passed user
		 * @audience - name of audience
		 * @notification - notification object
		 * @user - user to whom the notification is being related (recipient)
		 */
		function generateUserNotifications(audience, notification, user, done){
			UserNotification.create({
				userId: user.id,
				notificationId: notification.id
			}).done(function(err, newUserNotification){
				if(err){ console.log(err); done(null, newUserNotification, user, notification, audience); return false;}
    		done(null, newUserNotification, user, notification, audience);
			});
		}


		/**
		 * private function that iterates through each delivery for the given notification and processes it
		 * @notification - notification object
		 * @recipient - user to whom the delivery is being sent
		 * @userNotification - userNotification object
		 */
		function deliverNotification(notification, recipient, userNotification, callback){
			var strategyName;
			var preflightContent = {};
			for(key in sails.config.notifications.triggerRoutes[params.trigger.action].audience[notification.audience].strategy)
			{
				strategyName = key;
			}
			params.data.audience[notification.audience].strategy = params.data.audience[notification.audience].strategy || {};
			params.data.audience[notification.audience].strategy[strategyName] = params.data.audience[notification.audience].strategy[strategyName] || {};
			params.data.audience[notification.audience].strategy[strategyName].preflight = params.data.audience[notification.audience].strategy[strategyName].preflight || {};
			params.data.audience[notification.audience].strategy[strategyName].delivery = params.data.audience[notification.audience].strategy[strategyName].delivery || {};
			deliver(
				sails.config.notifications.triggerRoutes[params.trigger.action].audience[notification.audience].strategy[strategyName],
				notification,
				recipient,
				userNotification,
				callback
			);

			/**
			 * private function that consumes main param fields/settings and performs all pre-flight notification preparation for delivery, then consumes main param fields/settings to generate a delivery and send it
			 * @notification - notification object
			 * @recipient - user to whom the delivery is being sent
			 * @userNotification - userNotification object
			 * @strategy - string name of delivery strategy defined in the notifications config
			 */
			function deliver(strategy, notification, recipient, userNotification, done){
				var preflightStrategies;
				strategy.preflight = strategy.preflight || [];
				preflightStrategies = strategy.preflight;
				async.each(preflightStrategies, preparePreflight, function(err){
					prepareDelivery(notification, recipient, userNotification, strategy.delivery, preflightContent, done);
				});
			}
			/**
			 * private function that consumes main param fields/settings and performs all pre-flight notification preparation for delivery
			 * @preflightStrategy - string name of preflight strategy type
			 */
			function preparePreflight(preflightStrategy, done){
				params.data.audience[notification.audience].strategy[strategyName].preflight[preflightStrategy] = params.data.audience[notification.audience].strategy[strategyName].preflight[preflightStrategy] || {};
				var localVars = _.extend({}, params.data.audience[notification.audience].strategy[strategyName].preflight[preflightStrategy]);
				localVars.fields = localVars.fields || {};
				localVars.fields.recipientId = recipient.id;
				localVars.fields.callerId = notification.callerId;
				sythesizeSettings(
					localVars,
					sails.config.notifications.preflights[preflightStrategy],
					function(err, settings){
						if(err){ console.log(err); done(null); return false;}
						synthesizeAndValidateFields(
							localVars,
							sails.config.notifications.preflights[preflightStrategy],
							sails.services.utils.lib['validateFields'],
							function(err, fields){
								if(err){ console.log(err); done(null); return false;}
								performServiceAction(
									sails.services.notifications['notification'],
									sails.config.notifications.preflights[preflightStrategy].method,
									{ settings: settings, fields: fields },
									function(err, content){
										if(err){ console.log(err); done(null); return false;}
										preflightContent = lib.deepExtend(preflightContent, content);
										done(err);
									}
								);
							}
						);
					}
				);
			}
			/**
			 * private function that consumes main param fields/settings and generates a delivery and sends it
			 * @notification - notification object
			 * @recipient - user to whom the delivery is being sent
			 * @userNotification - userNotification object
			 * @deliveryStrategy - string name of delivery strategy defined in the notifications config
			 * @content - content to be added to delivery data
			 */
			function prepareDelivery(notification, recipient, userNotification, deliveryStrategy, content, done){
				params.data.audience[notification.audience].strategy[strategyName].delivery[deliveryStrategy] = params.data.audience[notification.audience].strategy[strategyName].delivery[deliveryStrategy] || {};
				var localVars = _.extend({}, params.data.audience[notification.audience].strategy[strategyName].delivery[deliveryStrategy]);
				localVars.fields = localVars.fields || {};
				localVars.settings = localVars.settings || {};
				localVars = lib.deepExtend(content, localVars);
				sythesizeSettings(
					localVars,
					sails.config.notifications.deliveries[deliveryStrategy],
					{userId: recipient.id, action: params.trigger.action, audience: notification.audience, delivery: deliveryStrategy},
					function(err, settings){
						if(err){ console.log(err); done(null, null); return false;}
						synthesizeAndValidateFields(
							localVars,
							sails.config.notifications.deliveries[deliveryStrategy],
							sails.services.utils.lib['validateFields'],
							function(err, fields){
								if(err){ console.log(err); done(null, null); return false;}
								generateDelivery(notification, userNotification, deliveryStrategy, content, function(err, delivery){
									if(err){ console.log(err); done(null, null); return false;}
									registerDeliveryAsSent(delivery, { settings: settings, fields: fields }, done);
								});
							}
						);
					}
				);
			}
			/**
			 * private function creates the delivery model
			 * @notification - notification object
			 * @userNotification - userNotification object
			 * @deliveryType - string name of delivery type
			 * @content - content to be added to delivery data
			 */
			function generateDelivery(notification, userNotification, deliveryType, content, done){
				Delivery.create({
					userNotificationId: userNotification.id,
					deliveryType: deliveryType,
					content: JSON.stringify(content)
				}).done(function(err, delivery){
					if(err){ console.log(err); done(null, delivery); return false; }
					done(err, delivery);
				});
			}
			/**
			 * private function that updates a delivery as sent
			 * @delivery - string name of delivery type
			 * @paramObject - parameters to be sent to delivery
			 */
			function registerDeliveryAsSent(delivery, paramObject, done){
				performServiceAction(
					sails.services.notifications['dispatcher'],
					sails.config.notifications.deliveries[delivery.deliveryType].method,
					paramObject,
					function(err, response){
						if(err){ console.log(err); done(null); return false; }
						delivery.isDelivered = true;
						delivery.deliveryDate = new Date();
						delivery.save(done);
					}
				);
			}

		}
		/**
		 * private helper function that properly sets all settings
		 * @hostObject - object that contains a settings property
		 * @globalObject - global object that contains a settings property
		 * @userSettingTemplate - optional property that contains a match for user settings
		 */
		function sythesizeSettings(hostObject, globalObject, userSettingTemplate, done){
			var settings, localSettings, globalSettings;
			hostObject.settings = hostObject.settings || {};
			globalObject.settings = globalObject.settings || {};
			settings = {};
			localSettings = _.extend({}, hostObject.settings);
			globalSettings = _.extend({}, globalObject.settings);
			if(typeof userSettingTemplate === 'function'){
				done = userSettingTemplate;
				settings = lib.deepExtend(globalSettings, localSettings);
				done(null, settings);
			}
			else{
				UserSetting.find({
					userId: userSettingTemplate.userId,
					context: JSON.stringify({ action: userSettingTemplate.action, audience: userSettingTemplate.audience, delivery: userSettingTemplate.delivery })
				}).done(function(err, settings){
					if(err){ console.log(err); done(null, settings); return false;}
					userSettingObject = {};
					userSettingObject[userSettingTemplate.actionType] = {};
					userSettingObject[userSettingTemplate.actionType].audience = {};
					userSettingObject[userSettingTemplate.actionType].audience[userSettingTemplate.audience] = {};
					_.each(settings, function(userSetting){
						userSettingObject[userSettingTemplate.actionType].audience[userSettingTemplate.audience][userSetting.key] =  userSetting.value;
					});
					// setting priority is local > user > global
					settings = lib.deepExtend(
						globalSettings,
						userSettingObject,
						localSettings
					);
					done(err, settings);
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
			var localFields, globalFields;
			hostObject.fields = hostObject.fields || {};
			globalObject.fields = globalObject.fields || {};
			// fields = {};
			localFields = _.extend({}, hostObject.fields);
			globalFields = _.extend({}, globalObject.fields);
			validator(localFields, globalFields, function(err, fields){
				done(err, fields);
			});
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
