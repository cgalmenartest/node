/**
 * Source definition for preparing delivery of notifications (preflight)
 *
 * @module    :: preflight.js
 * @description :: defines service methods for delivery preflights
 */
var _ = require('underscore');

module.exports = {
  // don't modify delivery content
  execute: function (fields, settings, cb) {
  	var content = {};
  	// set all default global locals for email
  	content.fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals']('taskVolunteerAddedOwnerReply'));
  	content.settings = {};
  	UserEmail.find({ userId : fields.recipientId }).done(function (err, userEmails) {
  	  if (err) { sails.log.debug(err); cb(null, content); return false; }
  	  var userEmail = userEmails.pop();
  	  if (userEmail) {
  	    content.fields.to = userEmail.email;
  	  }
  	  else {
  	    content.fields.to = null;
  	  }
  	  Task.find({ id: fields.callerId }).done(function (err, tasks) {
  	    if (err) { sails.log.debug(err); cb(null, content); return false;}
  	    var task = tasks.pop();
  	    if (task) {
  	      sails.services.utils.user['getUser'](fields.volunteerId, fields.volunteerId, function (err, volunteer) {
  	        if (err) { sails.log.debug(err); cb(null, content); return false; }
  	        if (volunteer) {
  	          content.fields.layout = 'default';
  	          content.fields.template = 'taskVolunteerAddedOwnerReply';
  	          content.fields.from = sails.config['systemEmail'];
  	          content.fields.subject = "Your Task \"" + task.title + "\" Has a New Volunteer: " + (volunteer.name ? volunteer.name : "unknown");
  	          content.fields.templateLocals = content.fields.templateLocals || {};
  	          content.fields.templateLocals.taskTitle = task.title;
  	          content.fields.templateLocals.taskLink = sails.config['httpProtocol'] + '://' + sails.config['hostName'] + '/tasks/' + task.id;
  	          content.fields.templateLocals.profileLink = sails.config['httpProtocol'] + '://' + sails.config['hostName'] + '/profile/' + volunteer.id;
  	          content.fields.templateLocals.profileTitle = (volunteer.title ? volunteer.title : "");
  	          content.fields.templateLocals.profileName = (volunteer.name ? volunteer.name : "unknown");
  	          volunteer.location = volunteer.location || {};
  	          volunteer.location.tag = volunteer.location.tag || {};
  	          volunteer.location.tag.name = volunteer.location.tag.name || '';
  	          volunteer.agency = volunteer.agency || {};
  	          volunteer.agency.tag = volunteer.agency.tag || {};
  	          volunteer.agency.tag.name = volunteer.agency.tag.name || '';
  	          content.fields.templateLocals.profileLocation = volunteer.location.tag.name;
  	          content.fields.templateLocals.profileAgency = volunteer.agency.tag.name;
  	        }
  	        cb(err, content);
  	      });
  	    }
  	    else {
  	      cb(err, content);
  	    }
  	  });
  	});
  }
}