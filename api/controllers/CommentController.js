/**
 * CommentController
 *
 * @module    :: Controller
 * @description :: Handles comment actions for topics, comments, and replies
 */
var _ = require('underscore');
var async = require('async');

module.exports = {

  findAllByProjectId: function (req, res) {
    // Find all topics
    Comment.find()
    .where({ topic: true })
    .where({ projectId: req.params.id })
    .exec(function (err, topics) {
      if (err) return res.send(400, { message: 'Error looking up comments.'});
      if (!topics || (topics.length == 0)) { return res.send({ comments: [] }); }
      // create an array indexed by topics to insert comments
      var userIds = [];
      var topicArray = {};
      for (var i = 0; i < topics.length; i++) {
        topics[i].comments = [];
        topicArray[topics[i].id] = topics[i];
        userIds.push(topics[i].userId);
      }

      Comment.find()
      .where({ topic: false })
      .where({ projectId: req.params.id })
      .exec(function (err, comments) {
        if (err) return res.send(400, { message: 'Error looking up comments.'});
        var newArray = {};
        var users = {};
        // Create an associative array to attach children
        for (var i = 0; i < comments.length; i++) {
          if (!_.has(userIds, comments[i].userId)) { userIds.push(comments[i].userId); }
        }

        var getId = function (id, done) {
          User.findOneById(id, function (err, user) {
            if (err) { return done(err); }
            users[id] = user;
            done();
          });
        };

        async.each(userIds, getId, function (err) {
          if (err) return res.send(400, { message: 'Error looking up events.'});
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
          res.send({ comments:  _.values(topicArray) });
        });
      });
    });
  }
};
