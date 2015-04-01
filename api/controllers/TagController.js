/**
 * TagController
 *
 * @module    :: Controller
 * @description :: Manipulate tags (add / delete / assign to projects/tasks)
 */

var _ = require('underscore');
var async = require('async');
var projUtils = require('../services/utils/project');
var taskUtils = require('../services/utils/task');
var tagUtils = require('../services/utils/tag');

module.exports = {
  findAllByUserId: function (req, res) {
    // If no :id is specified, get for the logged in user
    var userId;
    if (req.user) {
      userId = req.user[0].id;
    }
    // Otherwise user the :id specified
    if (req.params.id) {
      userId = req.params.id;
    }
    if (!userId) { return res.send(400, { message: "You must specify a user id" }); }
    tagUtils.assemble({ userId: userId }, function (err, tags) {
      if (err) { return res.send(400, { message: "Error looking up tags"}); }
      return res.send(tags);
    });
  },

  findAllByTaskId: function (req, res) {
    tagUtils.assemble({ taskId: req.params.id }, function (err, tags) {
      if (err) { return res.send(400, { message: "Error looking up tags"}); }
      return res.send(tags);
    });
  },

  findAllByProjectId: function (req, res) {
    tagUtils.assemble({ projectId: req.params.id }, function (err, tags) {
      if (err) { return res.send(400, { message: "Error looking up tags"}); }
      return res.send(tags);
    });
  },

  // Add a new tag entity to the system (alias for TagEntity.create)
  add: function (req, res) {
    if (req.route.method != 'post') { return res.send(400, { message: 'Unsupported operation.' } ); }
    var tag = _.extend(req.body || {}, req.params);
    // Delete undefined tag id added to request
    delete tag.id;
    if (_.isUndefined(tag.name) || (_.isUndefined(tag.type))) {
      return res.send(400, { message: 'Must specify tag name and type.' });
    }
    // Trim whitespace
    tag.name = tag.name.trim();
    TagEntity.find({ where: { type: tag.type, name: tag.name }}, function (err, existingTags) {
      if (err) { return res.send(400, { message: 'Error looking up tag' }); }
      // check if an existing tag matches
      if (existingTags && existingTags.length > 0) {
       return res.send(existingTags[0]);
      }
      // if not, create the tag
      TagEntity.create(tag, function (err, tag) {
        if (err) { return res.send(400, { message: 'Error creating tag' }); }
        return res.send(tag);
      });
    });
  },

  // Override default create to check parameters and
  // ensure duplicate tags are not created.
  create: function (req, res) {
    return res.ok();
    if (req.route.method != 'post') return res.badRequest('Unsupported operation.');
    var tag = _.extend(req.body || {}, req.params);
    if (!tag.projectId) tag.projectId = null;
    if (!tag.taskId) tag.taskId = null;
    if (!tag.tagId) return res.badRequest('Must specify a tag id');
    if (tag.userId && (tag.userId != req.user[0].id) && (req.user[0].isAdmin !== true)) {
      return res.forbidden();
    }
    // if neither are specified, associate with a user.
    if (!tag.projectId && !tag.taskId && !tag.userId) tag.userId = req.user[0].id;

    if (tag.projectId) Project.findOne({ id: tag.projectId }).exec(exec);
    else if (tag.taskId) Task.findOne({ id: tag.taskId }).exec(exec);
    else if (tag.userId) User.findOne({ id: tag.userId }).exec(exec);

    function exec(err, model) {
      if (err) return done(err);
      model.tags.add(tag.tagId);
      model.save(done);
    }

    function done(err, query) {
      if (err) return res.badRequest(err.err || err);
      res.send(query);
    }
  },

  // Override destroy to ensure owner has access to project
  destroy: function (req, res) {
    if (req.route.method != 'delete') { return res.send(400, { message: 'Unsupported operation.' } ); }
    var user = req.user[0];
    Tag.findOneById( req.params.id, function (err, tag) {
      if (err) { return res.send(400, { message: 'Error looking up tag' }); }
      if (!tag) { return res.send(404, { message: 'Tag not found'}); }
      // check if this user is authorized
      var checkAuthorization = function (err, item) {
        if (err) { return res.send(400, { message: err }); }
        if (!err && !item) {
          return res.send(403, { message: 'Not authorized.'});
        }
        // for task and project tags, check that the item is owned by the logged in user
        if (!_.isUndefined(item.isOwner) && (item.isOwner !== true) && (user.isAdmin !== true)) {
          return res.send(403, { message: 'Not authorized.'});
        }
        // for user related tags, check if the tag belongs to the user
        if (_.isUndefined(item.isOwner) && !_.isUndefined(item.userId) && (item.userId !== user.id) && (user.isAdmin !== true)) {
          return res.send(403, { message: 'Not authorized.'});
        }
        tag.destroy(function (err) {
          if (err) { return res.send(400, { message: 'Error destroying tag mapping' }); }
          return res.send(tag);
        });
      }
      if (tag.projectId) {
        projUtils.authorized(tag.projectId, user.id, checkAuthorization)
      } else if (tag.taskId) {
        taskUtils.authorized(tag.taskId, user.id, checkAuthorization)
      } else {
        checkAuthorization((!((user.id == tag.userId) || (user.isAdmin === true))), tag);
      }
    });
  }

};
