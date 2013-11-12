/**
 * SearchController
 *
 * @module		:: Controller
 * @description	:: Performs search functions for the front end
 */

var _ = require('underscore');
var async = require('async');
var util = require('../services/utils/project');

module.exports = {

  index: function (req, res) {
    if (!req.body) {
      return res.send(400, { message: 'Need data to query' });
    }
    // Store the userid for use later
    var userId = null;
    if (req.user) {
      userId = req.user[0].id;
    }
    // make the query well formed
    var q = req.body;
    q.projects = q.projects || [];
    q.tags = q.tags || [];

    // store the result data
    var projects = [];
    var projectIds = q.projects;

    // For each tag, find projects associated with it
    var processTag = function (tagId, cb) {
      Tag.find()
      .where({ tagId: tagId })
      .where({ projectId: { not: null }})
      .exec(function (err, tags) {
        for (var t in tags) {
          if (_.indexOf(projectIds, tags[t].projectId) == -1) {
            projectIds.push(tags[t].projectId);
          }
        }
        cb(err);
      });
    };

    // Get the project by checking if we're authorized to view it
    var checkProject = function (projectId, cb) {
      util.authorized(projectId, userId, function (err, proj) {
        if (!err && proj) { projects.push(proj); }
        cb(err);
      });
    };

    // Get each of the projects with given tags
    async.each(q.tags, processTag, function (err) {
      if (err) { return res.send(400, { message: 'Error performing query.'}); }
      // Get the details of each project
      async.each(projectIds, checkProject, function (err) {
        if (err) { return res.send(400, { message: 'Error performing query.'}); }
        // Get project metadata
        async.each(projects, util.addCounts, function (err) {
          if (err) { return res.send(400, { message: 'Error performing query.'}); }
          res.send(projects);
        });
      });
    });
  },

};
