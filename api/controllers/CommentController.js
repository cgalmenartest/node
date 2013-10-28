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
  .where({ topic: true })
  .where(where)
  .exec(function (err, topics) {
    if (err) return done(err, null);
    if (!topics || (topics.length == 0)) { return done(null, []); }
    // create an array indexed by topics to insert comments
    var userIds = [];
    var topicArray = {};
    for (var i = 0; i < topics.length; i++) {
      topics[i].comments = [];
      topicArray[topics[i].id] = topics[i];
      if (_.indexOf(userIds, topics[i].userId) == -1) { userIds.push(topics[i].userId); }
    }

    Comment.find()
    .where({ topic: false })
    .where(where)
    .exec(function (err, comments) {
      if (err) return done(err, null);
      var newArray = {};
      var users = {};
      // Create an associative array to attach children
      sails.log.debug(comments);
      for (var i in comments) {
        if (_.indexOf(userIds, comments[i].userId) == -1) { userIds.push(comments[i].userId); }
      }
      sails.log.debug(userIds);

      var getId = function (id, next) {
        User.findOneById(id, function (err, user) {
          if (err) { return next(err); }
          users[id] = user;
          next();
        });
      };

      async.each(userIds, getId, function (err) {
        sails.log.debug(users);
        if (err) return done(err, null);
        // Attach userIds to topics
        for (var i = 0; i < topics.length; i++) {
          topics[i].user = { username: users[topics[i].userId].username, name: users[topics[i].userId].name }
        }
        for (var i = 0; i < comments.length; i++) {
          if (_.has(topicArray, comments[i].parentId)) {
            newArray[comments[i].id] = comments[i];
          }
        }
        // Find children and attach them to their parent
        for (var i = 0; i < comments.length; i++) {
          sails.log.debug(comments[i]);
          sails.log.debug(users[comments[i].userId]);
          comments[i].user = { username: users[comments[i].userId].username, name: users[comments[i].userId].name }
          if (comments[i].parentId) {
            var parent = newArray[comments[i].parentId]
            // check that the parent is another comment and not a topic
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(comments[i]);
            } else {
            }
          }
        }

        var commentsNested = _.values(newArray);
        // Find comments and attach to their topic
        for (var i = 0; i < commentsNested.length; i++) {
          topicArray[commentsNested[i].parentId].comments.push(commentsNested[i]);
        }
        // Only return the array, not the associative array
        return done(null, _.values(topicArray));
      });
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
