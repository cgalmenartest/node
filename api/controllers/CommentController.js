/**
 * CommentController
 *
 * @module    :: Controller
 * @description :: Handles comment actions for topics, comments, and replies
 */
var _ = require('underscore');
var async = require('async');

/**
 * Gets all the comments given a particular
 * where clause, allowing flexibly fetching
 * comments for different parts of the application,
 * such as projects or task.
 *
 * Example: commentAssemble({ projectId: id }, function (err, comments) { });
 */
var commentAssemble = function (where, done) {
  // Find all topics
  Comment.find()
  // .where({ topic: true })
  .where(where)
  .sort('id')
  .exec(function (err, comments) {
    if (err) return done(err, null);

    var userIds = [];
    for (var i = 0; i < comments.length; i++) {
      if (!_.has(userIds, comments[i].userId)) { userIds.push(comments[i].userId); }
    }

    var users = {};
    var getId = function (id, next) {
      User.findOneById(id, function (err, user) {
        if (err) { return next(err); }
        users[id] = user;
        next();
      });
    };

    async.each(userIds, getId, function (err) {
      if (err) return done(err, null);
      // Attach userIds to topics
      for (var i = 0; i < comments.length; i++) {
        comments[i].user = { username: users[comments[i].userId].username, name: users[comments[i].userId].name }
      }
      return done(null, comments);
    });
  });
};

module.exports = {

  findAllByTaskId: function (req, res) {
    commentAssemble({ taskId: req.params.id }, function (err, comments) {
      if (err) { return res.send(400, { message: 'Error looking up coments'}); }
      return res.send({ comments: comments });
    });
  },

  findAllByProjectId: function (req, res) {
    commentAssemble({ projectId: req.params.id }, function (err, comments) {
      if (err) { return res.send(400, { message: 'Error looking up coments'}); }
      return res.send({ comments: comments });
    });
  }
};
