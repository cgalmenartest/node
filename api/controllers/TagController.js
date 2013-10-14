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

/**
 * Gets all the tags given a particular
 * where clause, allowing flexibly fetching
 * tags for different parts of the application,
 * such as projects, tasks, or people.
 *
 * Example: commentAssemble({ projectId: id }, function (err, comments) { });
 */
var tagAssemble = function (where, done) {
  Tag.find()
  .where(where)
  .exec(function (err, tags) {
    if (err) { return done(err, null); }
    if (!tags || (tags.length == 0)) { return done(null, []); }
    var entities = {};
    var tagIds = [];

    // Helper function for async to look up each tag entitiy
    var getTags = function (tagId, next) {
      if (entities[tagId]) { return next(); }
      TagEntity.findOne(tagId, function (err, t) {
        entities[tagId] = t;
        next(err);
      });
    }

    // Get all the tag ids
    for (var i = 0; i < tags.length; i++) {
      tagIds.push(tags[i].tagId);
    }

    // Get the tag entities for each id
    async.each(tagIds, getTags, function(err) {
      if (err) { return done(err, null); }
      // Attach the tag entity to the tag
      for (var i = 0; i < tags.length; i++) {
        tags[i].tag = entities[tags[i].tagId];
      }
      return done(null, tags);
    });
  });
};

module.exports = {

  findAllByTaskId: function (req, res) {
    tagAssemble({ taskId: req.params.id }, function (err, tags) {
      if (err) { return res.send(400, { message: "Error looking up tags"}); }
      return res.send(tags);
    });
  },

  findAllByProjectId: function (req, res) {
    tagAssemble({ projectId: req.params.id }, function (err, tags) {
      if (err) { return res.send(400, { message: "Error looking up tags"}); }
      return res.send(tags);
    });
  },

  // Add a new tag entity to the system (alias for TagEntity.create)
  add: function (req, res) {
    if (req.route.method != 'post') { return res.send(400, { message: 'Unsupported operation.' } ); }
    var tag = _.extend(req.body || {}, req.params);
    TagEntity.find({ where: { type: tag.type, like: { name: tag.name }}}, function (err, existingTags) {
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
    if (req.route.method != 'post') { return res.send(400, { message: 'Unsupported operation.' } ); }    
    var tag = _.extend(req.body || {}, req.params);
    if (!tag.projectId) { tag.projectId = null; }
    if (!tag.taskId) { tag.taskId = null; }
    if (!tag.tagId) { return res.send(400, { message: "Must specify a tag id" }); }
    if (!tag.projectId && !tag.taskId) { return res.send(400, { message: "Must specify either a project or task" }); }
    // check if the tag already exists
    Tag.findOne(
      { where: { projectId: tag.projectId, taskId: tag.taskId, tagId: tag.tagId }},
      function (err, existingTag) {
        if (err) { return res.send(400, { message: 'Error looking up tag' }); }
        // Let the UI know that the tag existed and so wasn't created
        if (existingTag) {
          existingTag.existing = true;
          return res.send(existingTag);
        }
        // Create tag if it doesn't exist
        Tag.create(tag, function (err, tag) {
          if (err) { return res.send(400, { message: 'Error creating tag' }); }
          return res.send(tag);
        });
      }
    );
  },

  // Override destroy to ensure owner has access to project
  destroy: function (req, res) {
    if (req.route.method != 'delete') { return res.send(400, { message: 'Unsupported operation.' } ); }    
    Tag.findOneById( req.params.id, function (err, tag) {
      if (err) { return res.send(400, { message: 'Error looking up tag' }); }
      if (!tag) { return res.send(404, { message: 'Tag not found'}); }
      // check if this user is authorized
      var checkAuthorization = function (err, item) {
        if (err) { return res.send(400, { message: err }); }
        if (!err && !item) { return res.send(403, { message: 'Not authorized.'}); }
        tag.destroy(function (err) {
          if (err) { return res.send(400, { message: 'Error destroying tag mapping' }); }
          return res.send(tag);
        });
      }
      if (tag.projectId) {
        projUtils.authorized(tag.projectId, req.user[0].id, checkAuthorization)
      } else {
        taskUtils.authorized(tag.taskId, req.user[0].id, checkAuthorization)
      }
    });
  }

};
