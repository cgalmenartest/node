var async = require('async');
var _ = require('underscore');
var projUtils = require('./project');
var tagUtils = require('./tag');
/**
 * Gets all the information about a user.
 *
 * @param userId: the id of the user to query
 * @param reqId: the requester's id
 */
var getUser = function (userId, reqId, cb) {
  User.findOneById(userId, function (err, user) {
    delete user.deletedAt;
    if (err) { return cb(err, null); }
    tagUtils.assemble({ userId: userId }, function (err, tags) {
      if (err) { return cb(err, null); }
      for (i in tags) {
        delete tags[i].projectId;
        delete tags[i].taskId;
        delete tags[i].updatedAt;
        delete tags[i].deletedAt;
        delete tags[i].userId;
        delete tags[i].tag.createdAt;
        delete tags[i].tag.updatedAt;
        delete tags[i].tag.deletedAt;
        if (tags[i].tag.type == 'agency') {
          user.agency = tags[i];
        }
        if (tags[i].tag.type == 'location') {
          user.location = tags[i];
        }
       }
      user.tags = tags;
      Like.countByTargetId(userId, function (err, likes) {
        if (err) { return cb(err, null); }
        user.likeCount = likes;
        user.like = false;
        user.isOwner = false;
        Like.findOne({ where: { userId: reqId, targetId: userId }}, function (err, like) {
          if (err) { return cb(err, null); }
          if (like) { user.like = true; }
          sails.log.debug('User Get:', user);
          // stop here if the requester id is not the same as the user id
          if (userId != reqId) {
            return cb(null, user);
          }
          // Look up which providers the user has authorized
          UserAuth.findByUserId(userId, function (err, auths) {
            if (err) { return cb(err, null); }
            user.auths = [];
            for (var i = 0; i < auths.length; i++) {
              user.auths.push(auths[i].provider);
            }
            // Look up the user's email addresses
            UserEmail.findByUserId(userId, function (err, emails) {
              if (err) { return cb(err, null); }
              user.isOwner = true;
              user.emails = [];
              if (emails) { user.emails = emails; }
              return cb(null, user);
            });
          });
        });
      });
    });
  });
};

module.exports = {
  getUser: getUser
};