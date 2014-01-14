/**
 * Source definition for
 *
 * @module    :: audience.js
 * @description :: defines service functions that return collections of users
 */
 var util = require('util');
 var events = require('events');
 var _ = require('underscore');
 var async = require('async');

// convenience function that accepts a collection of entities with a property "userId" (must be exact) and returns a collection of those users
function convertToUsers (err, userIdPropertyCollection, cb) {
  var uIds = [];
  _.each(userIdPropertyCollection, function (item) {
    uIds.push(item.userId);
  });
  if (uIds.length > 0) {
    User.find({
      where: { id: uIds }
    }).done(cb);
  }
  else {
    cb(null, []);
  }
};

module.exports = {

  findAllUsers: function (fields, settings, cb) {
    User.find({}).done(cb);
  },
  findUser: function (fields, settings, cb) {
    User.find({id: fields.userId}).done(cb);
  },
  findProjectOwners: function (fields, settings, cb) {
    ProjectOwner.find({projectId: fields.projectId}).done(function(err, owners){
      convertToUsers(err, owners, cb);
    });
  },
  findProjectParticipants: function (fields, settings, cb) {
    // todo
  },
  findProjectLikers: function (fields, settings, cb) {
    // todo
  },
  findProjectThreadCommenters: function (fields, settings, cb) {
    // todo
  },
  findProjectThreadParentCommenters: function (fields, settings, cb) {
    Comment.find({id : fields.commentId }).done(function (err, comments) {
      if(!err && comments.length > 0){
        var comment = comments.pop();
        // get all parent comments
        sails.services.utils['comment'].commentParentThreadAssemble(comment, {}, function (err, comments){
          if(!err){
            convertToUsers(err, comments, cb);
          }
          else {
            cb(err, []);
          }
        });
      }
      else {
        cb(err, []);
      }
    });
  },
  findTaskOwners: function (fields, settings, cb) {
    Task.find({id: fields.taskId}).done(function(err, owners){
      convertToUsers(err, owners, cb);
    });
  },
  findTaskParticipants: function (fields, settings, cb) {
    // todo
  },
  findTaskLikers: function (fields, settings, cb) {
    // todo
  },
  findTaskThreadCommenters: function (fields, settings, cb) {
    // todo
  },
  findTaskThreadParentCommenters: function (fields, settings, cb) {
    Comment.find({id : fields.commentId }).done(function(err, comments){
      if(!err && comments.length > 0){
        var comment = comments.pop();
        // get all parent comments
        sails.services.utils['comment'].commentParentThreadAssemble(comment, {}, function (err, comments){
          if(!err){
            convertToUsers(err, comments, cb);
          }
          else {
            cb(err, []);
          }
        });
      }
      else {
        cb(err, []);
      }
    });
  }

};
