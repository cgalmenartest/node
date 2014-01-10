/**
 * CommentController
 *
 * @module    :: Controller
 * @description :: Handles comment actions for topics, comments, and replies
 */
var _ = require('underscore');
var async = require('async');


module.exports = {


  findAllByTaskId: function (req, res) {
    sails.services.utils['comment'].commentAssemble({ taskId: req.params.id }, function (err, comments) {
      if (err) { return res.send(400, { message: 'Error looking up coments'}); }
      return res.send({ comments: comments });
    });
  },

  findAllByProjectId: function (req, res) {
    sails.services.utils['comment'].commentAssemble({ projectId: req.params.id }, function (err, comments) {
      if (err) { return res.send(400, { message: 'Error looking up coments'}); }
      return res.send({ comments: comments });
    });
  },

  findAllParentsById: function(req, res) {
    sails.services.utils['comment'].commentAssemble({ id: req.params.id }, function (err, comments) {
      if (err) { return res.send(400, { message: 'Error looking up coments'}); }
      var comment = comments.pop();
      sails.services.utils['comment'].commentParentThreadAssemble(comment, {}, function (err, comments){
        if (err) { return res.send(400, { message: 'Error looking up coments'}); }
        return res.send({ comments: comments });
      });
    });
  }
};
