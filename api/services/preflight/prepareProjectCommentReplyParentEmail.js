/**
 * Source definition for preparing delivery of notifications (preflight)
 *
 * @module    :: preflight.js
 * @description :: defines service methods for delivery preflights
 */
var _ = require('underscore');
var userUtils = require('../utils/user');
var commentUtils = require('../utils/comment');

module.exports = {
  // don't modify delivery content
  execute: function (fields, settings, cb) {
    var content = {};
    // set all default global locals for email
    content.fields = _.extend({}, sails.services.utils.emailTemplate['generateEmailLocals'](settings.emailName));
    content.fields.metadata = sails.services.utils.emailTemplate['addGlobals'](fields.metadata || {});
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
      // Get the comment object
      Comment.findOneById(fields.callerId).done(function (err, callComment) {
        if (err) { sails.log.debug(err); cb(null, content); return false; }
        content.fields.metadata.comment = callComment;
        if (callComment) {
          // Get the parent comment object
          Comment.findOneById(callComment.parentId).done(function (err, parComment) {
            if (err) { sails.log.debug(err); cb(null, content); return false; }
            content.fields.metadata.parentComment = parComment;
            if (parComment) {
              // Get information about the user who created the comment
              User.findOneById(callComment.userId).done(function (err, user) {
                if (err) { sails.log.debug(err); cb(null, content); return false; }
                content.fields.metadata.commentUser = user;
                if (user) {
                  // Get information about the project
                  Project.findOneById(parComment.projectId).done(function (err, project) {
                    if (err) { sails.log.debug(err); cb(null, content); return false; }
                    content.fields.metadata.project = project;
                    if (project) {
                      content.fields.from = sails.config['systemEmail'];
                      content.fields.subject = _.template(content.fields.subject, content.fields.metadata);
                      content.fields.templateLocals = content.fields.templateLocals || {};
                      content.fields.templateLocals.parentComment = commentUtils.cleanComment(parComment.value);
                      content.fields.templateLocals.callerComment = commentUtils.cleanComment(callComment.value);
                      content.fields.templateLocals.projectTitle = project.title;
                      content.fields.templateLocals.projectLink = content.fields.metadata.globals.urlPrefix + '/projects/' + project.id;
                    }
                    cb(err, content);
                  });
                }
                else{
                  cb(err, content);
                }
              });
            }
            else{
              cb(err, content);
            }
          });
        }
        else{
          cb(err, content);
        }
      });
    });
  }
};
