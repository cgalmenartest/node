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
    content.fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals']('projectCommentOwnerReply'));
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
      Comment.find({ id: fields.callerId }).done(function (err, comments) {
        if (err) { sails.log.debug(err); cb(null, content); return false; }
        var callComment = comments.pop();
        if (callComment) {
          Comment.find({ id: callComment.parentId }).done(function (err, comments) {
            if (err) { sails.log.debug(err); cb(null, content); return false; }
            var parComment = comments.pop();
            User.find({id: callComment.userId}).done(function (err, users) {
              if (err) { sails.log.debug(err); cb(null, content); return false; }
              var user = users.pop();
              if (user) {
                Project.find({id: callComment.projectId}).done(function (err, projects) {
                  if(err){ sails.log.debug(err); cb(null, content); return false;}
                  var project = projects.pop();
                  if(project){
                    content.fields.layout = 'default';
                    content.fields.template = 'projectCommentOwnerReply';
                    content.fields.from = sails.config['systemEmail'];
                    content.fields.subject = "Your Project \"" + project.title + "\" Has a New " +
                      (parComment ? " Reply To \"" + parComment.value + "\"" : "Discussion") ;
                    content.fields.templateLocals = content.fields.templateLocals || {};
                    content.fields.templateLocals.parentComment = (parComment ? parComment.value : 'New Topic');
                    content.fields.templateLocals.callerComment = callComment.value;
                    content.fields.templateLocals.projectTitle = project.title;
                    content.fields.templateLocals.projectLink = sails.config['httpProtocol'] + '://' + sails.config['hostName'] + '/projects/' + project.id;
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
        else {
          cb(err, content);
        }
      });
    });
  }
}