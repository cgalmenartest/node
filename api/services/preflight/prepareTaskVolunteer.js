/**
 * Source definition for preparing delivery of notifications (preflight)
 *
 * @module    :: preflight.js
 * @description :: defines service methods for delivery preflights
 */
var _ = require('underscore');
var userUtils = require('../utils/user');

module.exports = {
  // don't modify delivery content
  execute: function (fields, settings, cb) {
    var content = {};
    // set all default global locals for email
    content.fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals'](settings.emailName));
    content.fields.metadata = sails.services.utils.emailTemplate['addGlobals'](fields.metadata || {});
    content.settings = {};
    // look up primary email address for this user
    userUtils.findPrimaryEmail(fields.recipientId, function (err, userEmail) {
      if (err) { sails.log.debug(err); cb(null, content); return false; }
      if (userEmail) {
        content.fields.to = userEmail.email;
      }
      else {
        content.fields.to = null;
      }

      // store userEmail object as metadata
      content.fields.metadata.userEmail = userEmail;

      Task.findOneById(fields.callerId).exec(function (err, task) {
        if (err) { sails.log.debug(err); cb(null, content); return false;}
        // store the task in the metadata
        content.fields.metadata.task = task;

        User.findOne({ id: task.userId }).exec(function(err, taskOwner) {
          if (err) { sails.log.debug(err); cb(null, content); return false;}

          userUtils.findPrimaryEmail(taskOwner.id, function (err, taskOwnerEmail) {
            if (err) { sails.log.debug(err); cb(null, content); return false; }
            if (taskOwnerEmail) {
              content.fields.cc = taskOwner.name + ' <' + taskOwnerEmail.email + '>';
            }
            else {
              content.fields.cc = null;
            }

            content.fields.volunteerId = content.fields.metadata.modelTrigger.volunteerId || null;
            // for a volunteer this the volunteer id otherwise it will never not match
            content.fields.initiatorId = content.fields.metadata.modelTrigger.volunteerId || null;

            // set the email fields
            content.fields.from = sails.config['systemEmail'];
            content.fields.subject = _.template(content.fields.subject)(content.fields.metadata);
            // Set template local variables for task metadata
            content.fields.templateLocals = content.fields.templateLocals || {};
            content.fields.templateLocals.taskTitle = task.title;
            content.fields.templateLocals.taskLink = content.fields.metadata.globals.urlPrefix  + '/tasks/' + task.id;
            content.fields.templateLocals.taskOwner = taskOwner.name;
            content.fields.templateLocals.taskOwnerId = taskOwner.id;
            content.fields.templateLocals.taskOwnerEmail = taskOwnerEmail;

            // ********************
            // TODO: Need to figure out who should get the "assigned" emails
            // ********************

            if (!content.fields.volunteerId || !fields.recipientId) return cb(null, content);

            // Get user info for volunteerId on behalf of recipientId (protect privacy)
            sails.services.utils.user['getUser'](content.fields.volunteerId, fields.recipientId, function (err, volunteer) {
              if (err) { sails.log.debug(err); return cb(err, content); }
              // store the volunteer info
              content.fields.metadata.volunteer = volunteer;
              cb(null, content);
            });

          });
        });
      });
    });
  }
};
