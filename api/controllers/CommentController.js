/**
 * CommentController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */
var _ = require('underscore');
var async = require('async');

module.exports = {

  findAllByProjectId: function (req, res) {
    Comment.findByProjectId(req.params.id, function(err, comments) {
      if (err) return res.send(err, 500);
      var newArray = {};
      var userIds = [];
      var users = {};
      // Create an associative array to attach children
      for (var i = 0; i < comments.length; i++) {
        if (!_.has(userIds, comments[i].userId)) { userIds.push(comments[i].userId); }
        if (!comments[i].parentId) {
          newArray[comments[i].id] = comments[i];
        }
      }

      var getId = function (id, done) {
        User.findOneById(id, function (err, user) {
          if (err) { return done(err); }
          users[id] = user;
          done();
        });
      };

      async.each(userIds, getId, function (err) {
        // Find children and attach them to their parent
        for (var i = 0; i < comments.length; i++) {
          comments[i].user = { username: users[comments[i].userId].username, name: users[comments[i].userId].name }
          if (comments[i].parentId) {
            var parent = newArray[comments[i].parentId]
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(comments[i]);
          }
        }
        // Only return the array, not the associative array
        res.send({ comments: _.values(newArray) });
      });
    });
  }

};
