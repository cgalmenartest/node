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
  	content.fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals']('taskCommentParentReply'));
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
  	  Comment.find({ id: fields.callerId }).done(function (err, comments) {
  	    if (err) { sails.log.debug(err); cb(null, content); return false; }
  	    var callComment = comments.pop();
  	    if (callComment) {
  	      Comment.find({ id: callComment.parentId }).done(function (err, comments) {
  	        if (err) { sails.log.debug(err); cb(null, content); return false; }
  	        var parComment = comments.pop();
  	        if (parComment) {
  	          User.find({id: callComment.userId}).done(function (err, users) {
  	            if (err) { sails.log.debug(err); cb(null, content); return false; }
  	            var user = users.pop();
  	            if (user) {
  	              Task.find({id: parComment.taskId}).done(function (err, tasks) {
  	                if (err) { sails.log.debug(err); cb(null, content); return false; }
  	                var task = tasks.pop();
  	                if (task) {
  	                  content.fields.layout = 'default';
  	                  content.fields.template = 'taskCommentParentReply';
  	                  content.fields.from = sails.config['systemEmail'];
  	                  content.fields.subject = (user.name ? user.name : "Somebody") + " replied to you! Click the link below to see the entire discussion";
  	                  content.fields.templateLocals = content.fields.templateLocals || {};
  	                  content.fields.templateLocals.parentComment = parComment.value;
  	                  content.fields.templateLocals.callerComment = callComment.value;
  	                  content.fields.templateLocals.taskTitle = task.title;
  	                  content.fields.templateLocals.taskLink = sails.config['httpProtocol'] + '://' + sails.config['hostName'] + '/tasks/' + task.id;
  	                }
  	                cb(err, content);
  	              });
  	            }
  	            else {
  	              cb(err, content);
  	            }
  	          });
  	        }
  	        else {
  	          cb(err, content);
  	        }
  	      });
  	    }
  	    else {
  	      cb(err, content);
  	    }
  	  });
  	});
  }
}